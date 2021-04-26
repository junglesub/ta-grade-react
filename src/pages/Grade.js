import { Paper, TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import React from "react";

const options = ["22000462"];

function Grade() {
  return (
    <Paper>
      <Autocomplete
        id="hakbun"
        options={options}
        // getOptionLabel={(option) => option.title}
        style={{ width: 300 }}
        renderInput={(params) => (
          <TextField {...params} label="학번" variant="outlined" />
        )}
      />
    </Paper>
  );
}

export default Grade;
