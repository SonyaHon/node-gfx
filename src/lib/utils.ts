import { NodeCtor } from "./types";
import { INodeProps } from "./decorators";
import { NodeGFXEngine } from "./engine";
import { container } from "tsyringe";
import { NodeGFXEditorModel } from "./editor";
import { useState } from "react";

export const getNodeMetadata = (nodeCtor: NodeCtor): Required<INodeProps> => {
  return Reflect.getMetadata("__$node-card$__", nodeCtor);
};

export const getEngine = (): NodeGFXEngine => {
  return container.resolve(NodeGFXEngine);
};

export const useEngine = (): NodeGFXEngine => {
  const [engine] = useState(container.resolve(NodeGFXEngine));
  return engine;
};

export const getEditor = (): NodeGFXEditorModel => {
  return container.resolve(NodeGFXEditorModel);
};

export const useEditor = (): NodeGFXEditorModel => {
  const [editor] = useState(container.resolve(NodeGFXEditorModel));
  return editor;
};
