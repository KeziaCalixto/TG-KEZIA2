# Histórico individual antes de organizações

O requisito de organizações exige memberships, papéis e isolamento próprios. A primeira fatia usa histórico privado por usuário e adia colaboração para a segunda fatia: tabelas vazias e políticas permissivas dariam uma aparência enganosa de suporte a equipes. O modelo de destino e a evolução estão descritos em `docs/architecture.md`.

Estado: aceito para a primeira fatia, com escopo reduzido em relação ao sistema final. A migração futura deve associar dados existentes explicitamente, preservar a propriedade e testar acesso entre organizações antes de expor colaboração.
