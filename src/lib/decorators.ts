import { DataContainer } from "./container";

export interface INodeProps {
  title?: string;
  category?: string | null;
}

export const node = (id: string, props: INodeProps = {}): ClassDecorator => {
  return (target: any) => {
    Reflect.defineMetadata(
      "__$node-card$__",
      {
        title: props.title ?? target.name,
        category: props.category ?? null,
      },
      target
    );

    Reflect.defineMetadata("__$node-id$__", id, target);

    DataContainer.NODES.push(target);
  };
};
