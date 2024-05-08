import { Object3D } from "three";

// 递归查找threejs对象
export const findObject = (name: string, scene: any): Object3D | null => {
  if (!scene) return null;
  let obj = null;
  const find = (object: any) => {
    if (object.name === name) {
      obj = object;
    } else {
      object.children.forEach((child: any) => {
        find(child);
      });
    }
  };
  find(scene);
  return obj;
};

export const getAllSlots = (scene: any): Object3D[] => {
  const slots: Object3D[] = [];
  const find = (object: any) => {
    if (object.name.includes("slot")) {
      slots.push(object);
    } else {
      object.children.forEach((child: any) => {
        find(child);
      });
    }
  };
  find(scene);
  return slots;
};
