import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@material-ui/core";
import axios from "axios";
import React from "react";
import { url_config } from "../../url_config";

function GetLogin({ setToken }) {
  const [open, setOpen] = React.useState(false);
  const hisnetIdRef = React.useRef();
  const hisnetPwRef = React.useRef();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const loginUser = async () => {
    try {
      const token = (
        await axios.post(`${url_config.hisnet_grade}/login`, {
          username: hisnetIdRef.current.value,
          password: hisnetPwRef.current.value,
        })
      ).data;
      setToken(token.token);
      setOpen(false);
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <div>
      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Login
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">히즈넷 로그인</DialogTitle>
        <DialogContent>
          <DialogContentText>
            히즈넷 아이디와 비밀번호를 입력받아 로그인을 합니다.
            <br />
            비밀번호는 절대로 저장되지 않으며 로그인을 완료한 후 세션 정보를
            받아 암호화를 한 후에 암호화 키만 10분동안 서버에 저장하고 나머지는
            서버에 저장하지 않습니다.
          </DialogContentText>
          <TextField
            inputRef={hisnetIdRef}
            autoFocus
            margin="dense"
            id="name"
            label="HisnetID"
            fullWidth
            autoComplete="off"
          />
          <TextField
            inputRef={hisnetPwRef}
            margin="dense"
            id="name"
            label="HisnetPW"
            type="password"
            fullWidth
            autoComplete="off"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            취소
          </Button>
          <Button onClick={loginUser} color="primary">
            로그인
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default GetLogin;
