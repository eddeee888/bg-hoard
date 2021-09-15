import { Tree, formatFiles, updateJson, readJson } from '@nrwl/devkit';

function getScopes(nxJson: any) {
  const projects: any[] = Object.values(nxJson.projects);
  const allScopes: string[] = projects
    .map((project) =>
      project.tags
        // take only those that point to scope
        .filter((tag: string) => tag.startsWith('scope:'))
    )
    // flatten the array
    .reduce((acc, tags) => [...acc, ...tags], [])
    // remove prefix `scope:`
    .map((scope: string) => scope.slice(6));
  // remove duplicates
  return [...new Set(allScopes)];
}

export default async function (tree: Tree) {
  const scopes = getScopes(readJson(tree, 'nx.json'));
  updateJson(tree, 'tools/generators/util-lib/schema.json', (value) => {
    value.properties.directory['x-prompt'].items = scopes.map((scope) => ({
      value: scope,
      label: scope,
    }));
    return value;
  });
  await formatFiles(tree);
}
