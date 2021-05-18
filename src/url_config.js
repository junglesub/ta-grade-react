const urls = {
  prod: {
    hisnet_grade:
      "https://4lwodb5gg7.execute-api.us-east-1.amazonaws.com/dev/his",
  },
  dev: {
    hisnet_grade: "http://localhost:4000/dev/his",
  },
};

export const url_config =
  process.env.NODE_ENV === "production" ? urls.prod : urls.dev;
