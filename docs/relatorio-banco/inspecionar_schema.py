"""Inventaria DDL versionada sem conexão com o banco e sem executar SQL."""
from pathlib import Path
import hashlib
import json
import re

BASE = Path(__file__).resolve().parent
ROOT = BASE.parents[1]

def split_columns(body):
    parts, start, level, quote = [], 0, 0, None
    for i, char in enumerate(body):
        if quote:
            if char == quote:
                quote = None
        elif char in "'\"":
            quote = char
        elif char in '([':
            level += 1
        elif char in ')]':
            level -= 1
        elif char == ',' and level == 0:
            parts.append(body[start:i].strip())
            start = i + 1
    parts.append(body[start:].strip())
    return parts

def close_parenthesis(text, start):
    level, quote = 0, None
    for i in range(start, len(text)):
        char = text[i]
        if quote:
            if char == quote:
                quote = None
        elif char in "'\"":
            quote = char
        elif char == '(':
            level += 1
        elif char == ')':
            level -= 1
            if level == 0:
                return i
    raise ValueError('Unclosed CREATE TABLE')

def column_info(part):
    part = re.sub(r'--[^\n]*', '', part).strip()
    m = re.match(r'"?(\w+)"?\s+(.+)', part, re.S)
    if not m or m[1].lower() in {'constraint', 'check', 'unique', 'primary', 'foreign'}:
        return None
    rest = ' '.join(m[2].split())
    dtype = re.split(r'\s+(?:not\s+null|default|primary\s+key|references|check|unique)\b', rest, flags=re.I)[0]
    default = re.search(r'\bdefault\s+(.+?)(?=\s+(?:check|primary\s+key|references|unique|not\s+null)\b|$)', rest, re.I)
    return {'name': m[1], 'type': dtype, 'nullable': not bool(re.search(r'\bnot\s+null\b|\bprimary\s+key\b', rest, re.I)),
            'default': default[1] if default else None, 'definition': rest}

inventory = {'cutoff': '2026-11-04', 'method': 'static_versioned_migrations', 'migrations': [], 'tables': {}, 'functions': {}, 'indexes': [], 'policies': []}
name_pattern = r'"?(\w+)"?\."?(\w+)"?'
for source in sorted((ROOT / 'supabase/migrations').glob('*.sql')):
    text = source.read_text(encoding='utf8')
    relative = source.relative_to(ROOT).as_posix()
    inventory['migrations'].append({'path': relative, 'version': source.name.split('_')[0], 'sha256': hashlib.sha256(source.read_bytes()).hexdigest()})
    for m in re.finditer(r'create\s+table\s+' + name_pattern + r'\s*\(', text, re.I):
        start = m.end() - 1
        body = text[start + 1:close_parenthesis(text, start)]
        columns = [x for x in (column_info(p) for p in split_columns(body)) if x]
        inventory['tables'][m[1] + '.' + m[2]] = {'source': relative, 'line': text[:m.start()].count('\n') + 1, 'columns': columns}
    for m in re.finditer(r'alter\s+table\s+' + name_pattern + r'\s+add\s+column\s+([^;]+);', text, re.I):
        inventory['tables'][m[1] + '.' + m[2]]['columns'].append(column_info(m[3]))
    for m in re.finditer(r'create\s+(?:or\s+replace\s+)?function\s+' + name_pattern + r'\s*\(', text, re.I):
        end = text.find('$function$;', m.end())
        definition = text[m.start():end + 11]
        header = definition.split('$function$')[0]
        inventory['functions'][m[1] + '.' + m[2]] = {'source': relative, 'line': text[:m.start()].count('\n') + 1, 'security': 'definer' if re.search(r'security\s+definer', header, re.I) else 'invoker', 'search_path_empty': bool(re.search(r"search_path\s+to\s+''", header, re.I))}
    for m in re.finditer(r'create\s+(?:unique\s+)?index\s+[^;]+;', text, re.I):
        inventory['indexes'].append({'source': relative, 'line': text[:m.start()].count('\n') + 1, 'sql': ' '.join(m[0].split())})
    for m in re.finditer(r'create\s+policy\s+[^;]+;', text, re.I):
        inventory['policies'].append({'source': relative, 'line': text[:m.start()].count('\n') + 1, 'sql': ' '.join(m[0].split())})

assert len(inventory['migrations']) == 4
assert len(inventory['tables']) == 7
assert len(inventory['indexes']) == 7
assert len(inventory['policies']) == 7
assert len(inventory['functions']) == 22
inventory['counts'] = {'migrations': 4, 'project_tables': 7, 'columns': sum(len(x['columns']) for x in inventory['tables'].values()), 'explicit_indexes': 7, 'rls_policies': 7, 'final_functions': 22}
assert inventory['counts']['columns'] == 65
(BASE / 'schema-inventario.json').write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
print(json.dumps(inventory['counts'], ensure_ascii=False))
