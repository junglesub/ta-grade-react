const urls = {
  prod: {
    hisnet_grade: "",
  },
  dev: {
    hisnet_grade: "http://localhost:4000/dev/his",
  },
};

export const url_config =
  process.env.NODE_ENV === "production" ? urls.prod : urls.dev;
