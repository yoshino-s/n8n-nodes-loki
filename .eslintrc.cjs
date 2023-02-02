/**
 * @type {import('@types/eslint').ESLint.ConfigData}
 */
module.exports = {
	root: true,
	env: {
		browser: true,
		es6: true,
		node: true,
	},
	ignorePatterns: ["node_modules/", "dist/"],
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint/eslint-plugin"],
	extends: [
		"plugin:@typescript-eslint/recommended",
		"prettier",
		"plugin:prettier/recommended",
		"plugin:import/errors",
		"plugin:import/warnings",
		"plugin:import/typescript",
	],
	rules: {
		"prettier/prettier": ["error", { singleQuote: false }],
		"@typescript-eslint/no-explicit-any": "off",
		"@typescript-eslint/no-unused-vars": ["error", { ignoreRestSiblings: true }],
		semi: ["error", "always"],
		quotes: [2, "double", "avoid-escape"],
		"comma-dangle": ["error", "always-multiline"],
		"eol-last": ["error", "always"],
		"import/order": [
			"error",
			{
				"newlines-between": "always",
				alphabetize: {
					order: "asc",
				},
			},
		],
	},
	settings: {
		"import/resolver": {
			typescript: {},
		},
	},
	overrides: [
		{
			files: ["package.json"],
			plugins: ["eslint-plugin-n8n-nodes-base"],
			extends: ["plugin:n8n-nodes-base/community"],
			rules: {
				"n8n-nodes-base/community-package-json-name-still-default": "off",
			},
		},
		{
			files: ["./src/**/*.ts"],
			plugins: ["eslint-plugin-n8n-nodes-base"],
			extends: ["plugin:n8n-nodes-base/nodes"],
			rules: {
				"n8n-nodes-base/node-execute-block-missing-continue-on-fail": "off",
				"n8n-nodes-base/node-resource-description-filename-against-convention": "off",
				"n8n-nodes-base/node-param-fixed-collection-type-unsorted-items": "off",
			},
		},
	],
};
