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

function replaceScopes(content: string, scopes: string[]): string {
  const joinScopes = scopes.map((s) => `'${s}'`).join(' | ');
  const PATTERN = /interface Schema \{\n.*\n.*\n\}/gm;
  return content.replace(
    PATTERN,
    `interface Schema {
  name: string;
  directory: ${joinScopes};
}`
  );
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

  const utilLibIndexFilename = 'tools/generators/util-lib/index.ts';
  const indexContent = tree.read(utilLibIndexFilename, 'utf-8');
  const newContent = replaceScopes(indexContent, scopes);
  tree.write(utilLibIndexFilename, newContent);

  await formatFiles(tree);
}
