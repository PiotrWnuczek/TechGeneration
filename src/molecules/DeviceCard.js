import React, { useState, useEffect } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { removeDevice, removeData } from "store/devicesActions";
import { firebaseConnect } from "react-redux-firebase";
import { Typography, LinearProgress, Avatar, Button } from "@mui/material";
import { Box, Card, CardHeader, CardContent, IconButton } from "@mui/material";
import { ViewInAr, MoreVert } from "@mui/icons-material";
import DeviceChart from "atoms/DeviceChart";
import AiReport from "atoms/AiReport";

const DeviceCard = ({ removeDevice, removeData, device, controller }) => {
  const [options, setOptions] = useState(false);

  const [workSeconds, setWorkSeconds] = useState(
    controller &&
      Math.floor((new Date().getTime() - controller.StartWork) / 1000)
  );
  const [breakSeconds, setBreakSeconds] = useState(
    controller &&
      Math.floor((new Date().getTime() - controller.StartBreak) / 1000)
  );

  const [workSecondsPercents, setWorkSecondsPercents] = useState(
    Math.floor((workSeconds / 60) * 100) <= 100
      ? Math.floor((workSeconds / 60) * 100)
      : 100
  );
  const [breakSecondsPercents, setBreakSecondsPercents] = useState(
    Math.floor((breakSeconds / 10) * 100) <= 100
      ? Math.floor((breakSeconds / 10) * 100)
      : 100
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setWorkSeconds(
        controller &&
          Math.floor((new Date().getTime() - controller.StartWork) / 1000)
      );
      setBreakSeconds(
        controller &&
          Math.floor((new Date().getTime() - controller.StartBreak) / 1000)
      );
      setWorkSecondsPercents(
        Math.floor((workSeconds / 60) * 100) <= 100
          ? Math.floor((workSeconds / 60) * 100)
          : 100
      );
      setBreakSecondsPercents(
        Math.floor((breakSeconds / 10) * 100) <= 100
          ? Math.floor((breakSeconds / 10) * 100)
          : 100
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [controller]);

  const ifWork = controller && controller.StartWork > controller.StartBreak;

  return (
    <Card sx={{ borderRadius: 2 }} variant="outlined">
      <CardHeader
        title={
          <>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Cube: {device.name}
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Description: {device.description}
            </Typography>
          </>
        }
        subheader={
          <Typography sx={{ fontWeight: 600 }}>Key: {device.key}</Typography>
        }
        avatar={
          <Avatar>
            <ViewInAr />
          </Avatar>
        }
        action={
          <>
            {options && (
              <>
                <Button
                  sx={{ ml: 1 }}
                  onClick={() => {
                    removeDevice(device.id);
                  }}
                  variant="outlined"
                  color="error"
                  size="small"
                >
                  Delete
                </Button>
                <Button
                  sx={{ ml: 1 }}
                  onClick={() => removeData(device.key)}
                  variant="outlined"
                  size="small"
                >
                  Reset
                </Button>
              </>
            )}
            <IconButton onClick={() => setOptions(!options)} size="samll">
              <MoreVert />
            </IconButton>
          </>
        }
      />
      <CardContent>
        {controller && (
          <>
            {ifWork ? (
              <>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Work Time: {workSeconds} minutes
                </Typography>
                <LinearProgress
                  color="primary"
                  sx={{ mt: 2, height: 15, borderRadius: 15 }}
                  variant="determinate"
                  value={workSecondsPercents ?? 0}
                />
              </>
            ) : (
              <>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Break Time: {breakSeconds} minutes
                </Typography>
                <LinearProgress
                  color="success"
                  sx={{ mt: 2, height: 15, borderRadius: 15 }}
                  variant="determinate"
                  value={breakSecondsPercents ?? 0}
                />
              </>
            )}
            <AiReport
              temperature={controller.Temperature}
              humidity={controller.Humidity}
              brightness={controller.Brightness}
              startBreak={controller.StartBreak}
            />
            <Card variant="outlined" sx={{ width: "100%", py: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mx: 1 }}>
                Work Quality Level:{" "}
                {controller.Levels ? Object.values(controller.Levels).pop() : 0}{" "}
                \ 5
              </Typography>
            </Card>
            <Box sx={{ my: 2, display: "flex" }}>
              <Card variant="outlined" sx={{ p: 1, mr: 1, width: "100%" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Actually Temperature: {controller.Temperature.toFixed(2) ?? 0}
                  °C
                </Typography>
              </Card>
              <Card variant="outlined" sx={{ p: 1, mr: 1, width: "100%" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Actually Humidity: {controller.Humidity.toFixed(2) ?? 0}%
                </Typography>
              </Card>
              <Card variant="outlined" sx={{ p: 1, width: "100%" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Actually Brightness: {controller.Brightness.toFixed(2) ?? 0}%
                </Typography>
              </Card>
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Work quality in hours:
            </Typography>
            <DeviceChart levels={controller.Levels} />
          </>
        )}
      </CardContent>
    </Card>
  );
};

const mapStateToProps = (state, props) => ({
  controller: state.firebase.data[props.device.key],
});

const mapDispatchToProps = (dispatch) => ({
  removeDevice: (id) => dispatch(removeDevice(id)),
  removeData: (key) => dispatch(removeData(key)),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  firebaseConnect((props) => [props.device.key])
)(DeviceCard);
