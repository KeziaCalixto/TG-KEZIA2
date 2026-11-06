import { composeCalendars } from "./compose";
import { laborSp2026 } from "./labor-sp-2026";
import { laborSp2027 } from "./labor-sp-2027";

export const laborSp2026To2027 = composeCalendars([laborSp2026, laborSp2027], {
  id: "trt2-capital-2026-2027",
  version: "2026-10-22.demo.1",
  consultedOn: "2026-10-22",
});
