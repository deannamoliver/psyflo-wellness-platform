import { getEvalsAction } from "../../actions";
import { EvalManager } from "./eval-manager";

export default async function EvalsPage() {
  const evals = await getEvalsAction();

  return <EvalManager initialEvals={evals} />;
}
