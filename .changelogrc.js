module.exports = {
  preset: 'angular',
  releaseCount: 0,
  outputUnreleased: true,
  pkg: {
    path: './package.json'
  },
  append: false,
  transform: {
    // Custom transform for better commit grouping
    '*': (commit, context) => {
      // Group commits by type
      const typeMapping = {
        feat: 'Features',
        fix: 'Bug Fixes',
        docs: 'Documentation',
        style: 'Styles',
        refactor: 'Code Refactoring',
        perf: 'Performance Improvements',
        test: 'Tests',
        chore: 'Chores',
        build: 'Build System',
        ci: 'Continuous Integration'
      };

      if (commit.type && typeMapping[commit.type]) {
        commit.type = typeMapping[commit.type];
      }

      return commit;
    }
  }
};
