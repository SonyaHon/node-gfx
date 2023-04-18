import { Engine } from "./engine";

export interface INodeProps {
  title?: string;
  category?: string | null;
}

export const node = (props: INodeProps = {}): ClassDecorator => {
  return (target: any) => {
    Reflect.defineMetadata(
      "__$node$__",
      {
        title: props.title ?? target.name,
        category: props.category ?? null,
      },
      target
    );

    Engine.AVAILABLE_NODES.push(target);
  };
};
