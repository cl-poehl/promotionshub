import { runImporter } from "./importers/run";
import { tuDresdenSources } from "./importers/tu-dresden/sources";

runImporter("TU Dresden", tuDresdenSources).catch((err) => {
  console.error(err);
  process.exit(1);
});
