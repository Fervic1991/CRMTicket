import { Button } from "@material-ui/core";
import React, { useRef, useEffect, useState } from "react";
import api from "../../services/api";
import { Typography } from "@material-ui/core";
import { useTheme, makeStyles } from "@material-ui/core/styles";

const LS_NAME = "audioMessageRate";

// ✅ CORREÇÃO: Estilos específicos para controlar tamanho e aparência
const useStyles = makeStyles((theme) => ({
  audioContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '380px', // ✅ Limita largura máxima
    minWidth: '300px',  // ✅ Largura mínima
    padding: 0,
    margin: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    border: '1px solid rgba(148, 163, 184, 0.35)',
    borderRadius: 14,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingTop: theme.spacing(0.75),
    paddingBottom: theme.spacing(1),
    boxShadow: '0 10px 22px rgba(15, 23, 42, 0.08)'
  },
  audioPlayerContainer: {
    position: 'relative',
    width: '100%',
    height: '40px', // ✅ Altura fixa
    marginBottom: theme.spacing(1)
  },
  audioPlayer: {
    width: '100%',
    height: '40px', // ✅ Altura específica
    outline: 'none',
    border: 'none',
    backgroundColor: 'transparent',
    // ✅ Remove aparência padrão problemática
    '&::-webkit-media-controls-panel': {
      backgroundColor: 'transparent',
    },
    '&::-webkit-media-controls-current-time-display, &::-webkit-media-controls-time-remaining-display': {
      fontSize: '12px'
    }
  },
  controlsContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    gap: theme.spacing(1)
  },
  transcriptionContainer: {
    width: '100%',
    marginTop: theme.spacing(1),
    // ✅ CORREÇÃO: Centralizar o botão
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  transcriptionText: {
    fontSize: '0.875rem',
    lineHeight: 1.4,
    wordBreak: 'break-word',
    padding: theme.spacing(1),
    backgroundColor: 'rgba(248, 250, 252, 0.9)',
    borderRadius: 12,
    border: `1px solid rgba(148, 163, 184, 0.35)`,
    width: '100%',
    boxSizing: 'border-box'
  },
  transcribeButton: {
    fontSize: '0.75rem',
    padding: theme.spacing(0.5, 1),
    minWidth: 'auto',
    height: '32px',
    // ✅ CORREÇÃO: Centralizar o botão
    alignSelf: 'center',
    borderRadius: 12,
    textTransform: 'none',
    boxShadow: '0 6px 14px rgba(15, 23, 42, 0.12)'
  },
  rateButton: {
    position: 'absolute',
    top: '2px',
    right: '8px',
    fontSize: '0.7rem',
    minWidth: 'auto',
    padding: '1px 6px',
    height: '18px',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    color: 'white',
    borderRadius: '9px',
    zIndex: 10,
    lineHeight: 1,
    '&:hover': {
      backgroundColor: 'rgba(15, 23, 42, 0.9)'
    },
    // ✅ Remover estilos de botão padrão
    border: 'none',
    textTransform: 'none',
    boxShadow: 'none'
  }
}));

const AudioModal = ({ url, message, disableTranscription = false }) => {
  const theme = useTheme();
  const classes = useStyles();
  const audioRef = useRef(null);
  const [audioRate, setAudioRate] = useState(
    parseFloat(localStorage.getItem(LS_NAME) || "1")
  );
  const [showButtonRate, setShowButtonRate] = useState(false);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const [transcription, setTranscription] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const body = message?.body ?? "";
  const transcrito = message?.transcrito ?? false;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = audioRate;
      localStorage.setItem(LS_NAME, audioRate);
    }
  }, [audioRate]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onplaying = () => {
        setShowButtonRate(true);
      };
      audioRef.current.onpause = () => {
        setShowButtonRate(false);
      };
      audioRef.current.onended = () => {
        setShowButtonRate(false);
      };
    }
  }, []);

  const toggleRate = () => {
    let newRate = null;

    switch (audioRate) {
      case 0.5:
        newRate = 1;
        break;
      case 1:
        newRate = 1.5;
        break;
      case 1.5:
        newRate = 2;
        break;
      case 2:
        newRate = 0.5;
        break;
      default:
        newRate = 1;
        break;
    }

    setAudioRate(newRate);
  };

  const getAudioSource = () => {
    let sourceUrl = url;

    if (isIOS) {
      sourceUrl = sourceUrl.replace(".ogg", ".mp3");
    }

    return <source src={sourceUrl} type={isIOS ? "audio/mp3" : "audio/ogg"} />;
  };

  // Stato separato per ogni lingua
  const [isTranscribingIt, setIsTranscribingIt] = useState(false);
  const [isTranscribingEs, setIsTranscribingEs] = useState(false);
  const [transcriptionIt, setTranscriptionIt] = useState(null);
  const [transcriptionEs, setTranscriptionEs] = useState(null);

  const handleTranscribe = async (language) => {
    if (language === "it") setIsTranscribingIt(true);
    if (language === "es") setIsTranscribingEs(true);
    try {
      let audioData = {
        wid: message.wid,
        language,
      };
      const { data } = await api.post(`/message/transcribeAudio`, audioData);
      if (data) {
        if (language === "it") setTranscriptionIt(data);
        if (language === "es") setTranscriptionEs(data);
      } else {
        console.error("Invalid response data:", data);
      }
    } catch (error) {
      console.error("Erro ao transcrivere audio:", error);
    } finally {
      if (language === "it") setIsTranscribingIt(false);
      if (language === "es") setIsTranscribingEs(false);
    }
  };

  return (
    <div className={classes.audioContainer}>
      {/* ✅ Container do player igual ao original */}
      <div className={classes.audioPlayerContainer}>
        <audio 
          ref={audioRef} 
          controls 
          className={classes.audioPlayer}
          preload="metadata"
        >
          {getAudioSource()}
        </audio>
        
        {/* ✅ Botão de velocidade igual ao original */}
        {showButtonRate && (
          <Button
            className={classes.rateButton}
            onClick={toggleRate}
            size="small"
            disableRipple
          >
            {audioRate}x
          </Button>
        )}
      </div>

      {/* ✅ ÚNICA MUDANÇA: Container de controles com botão centralizado */}
      <div className={classes.controlsContainer}>
        {!disableTranscription && (
          <div className={classes.transcriptionContainer}>
            {!transcrito ? (
              transcription ? (
                <Typography className={classes.transcriptionText} variant="body2">
                  <strong>Transcrição:</strong> {transcription}
                </Typography>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                      onClick={() => handleTranscribe("it")}
                      variant="contained"
                      className={classes.transcribeButton}
                      disabled={isTranscribingIt}
                      style={{
                        backgroundColor: isTranscribingIt
                          ? "#ccc"
                          : theme.palette.primary.main,
                        color: "#fff",
                      }}
                    >
                      {isTranscribingIt ? "Trascrivendo..." : "Trascrivi in Italiano"}
                    </Button>
                    <Button
                      onClick={() => handleTranscribe("es")}
                      variant="contained"
                      className={classes.transcribeButton}
                      disabled={isTranscribingEs}
                      style={{
                        backgroundColor: isTranscribingEs
                          ? "#ccc"
                          : theme.palette.primary.main,
                        color: "#fff",
                      }}
                    >
                      {isTranscribingEs ? "Transcribiendo..." : "Transcribe in Spagnolo"}
                    </Button>
                  </div>
                  {/* Mostra la trascrizione se presente */}
                  {transcriptionIt && (
                    <Typography className={classes.transcriptionText} variant="body2">
                      <strong>IT:</strong> {transcriptionIt}
                    </Typography>
                  )}
                  {transcriptionEs && (
                    <Typography className={classes.transcriptionText} variant="body2">
                      <strong>ES:</strong> {transcriptionEs}
                    </Typography>
                  )}
                </>
              )
            ) : (
              <Typography className={classes.transcriptionText} variant="body2">
                <strong>Transcrição:</strong> {body}
              </Typography>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioModal;
