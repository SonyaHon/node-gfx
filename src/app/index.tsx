import { observer } from "mobx-react-lite";
import { Editor } from "../editor";

export const App = observer(() => {
  return (
    <div>
      <Editor />
    </div>
  );
});
