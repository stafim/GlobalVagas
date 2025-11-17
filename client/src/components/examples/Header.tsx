import { Header } from "../Header";

export default function HeaderExample() {
  return <Header onLanguageToggle={() => console.log("Language toggled")} />;
}
