module.exports = {
  extends: ["./base", "plugin:react/recommended"],
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    "react/jsx-key": "off",
  },
};
