import React from "react";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CircularProgress from "@material-ui/core/CircularProgress";
import axios from "axios";
import { url_config } from "../../url_config";

export default function GetClass({ token, value, changeClass }) {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState([]);
  const loading = open && options.length === 0;

  React.useEffect(() => {
    if (!loading) {
      return undefined;
    }

    (async () => {
      const classes = (
        await axios.post(`${url_config.hisnet_grade}/classes`, {
          token,
        })
      ).data;
      setOptions(classes);
      console.log(classes);
    })();
  }, [loading, token]);

  React.useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  return (
    <Autocomplete
      id="asynchronous-demo"
      style={{ width: 300 }}
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      // getOptionSelected={(option, value) => option.name === value.name}
      value={value}
      onChange={(e, next) => {
        console.log(next);
        changeClass(next);
      }}
      getOptionLabel={(classInfo) =>
        `[${classInfo.code}-${classInfo.ban}] ${classInfo.name}`
      }
      options={options}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label="과목선택"
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
}
