import { Tree, formatFiles, updateJson } from '@nrwl/devkit';

export default async function (tree: Tree, schema: any) {
  updateJson(tree, 'workspace.json', (value) => {
    value.defaultProject = schema.defaultProject;
    return value;
  });
  await formatFiles(tree);
}
