import { getScreenerFrequencySettingsAction } from "../../actions";
import { ScreenerFrequencySettings } from "./screener-frequency-settings";

export default async function ScreenerFrequencyPage() {
  const settings = await getScreenerFrequencySettingsAction();

  return <ScreenerFrequencySettings initialSettings={settings} />;
}
