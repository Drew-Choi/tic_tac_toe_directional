import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import COLOR_LIST from '../../../style/COLOR_LIST';
import { ImCancelCircle } from 'react-icons/im';
import { useRecoilValue } from 'recoil';
import { groundDataSet } from '../../../recoil/gameCondition';
import Typography from '@mui/material/Typography';
import { playerInfoChangeIcon } from '../../../recoil/player';

type GameBoardPopupPropsType = {
  onClickCancel: () => void;
  historyData: LocalStorageHistoryType;
};

const GameBoardPopup = ({ onClickCancel, historyData }: GameBoardPopupPropsType) => {
  const groundInitialData = useRecoilValue(groundDataSet);
  const playerInitialData = useRecoilValue(playerInfoChangeIcon);
  const [groundData, setGroundData] = useState<HistoryGroundDataType | null>(null);

  useEffect(() => {
    if (!groundInitialData || !playerInitialData) return;

    // 리코일 셀렉터 데이터가 읽기전용이라 deepCopy 필요
    const newGroundData = Object.keys(groundInitialData).reduce(
      (acc: HistoryGroundDataType, key: string) => {
        acc[Number(key)] = groundInitialData[Number(key)].map((cell) => cell as null);
        return acc;
      },
      {},
    );

    // history내역 붙이기
    historyData.history.forEach(([x, y], index) => {
      const playerInfo = playerInitialData[index % 2 === 1 ? 1 : 0];
      const newObjMark: HistoryGroundDataIndividualType = {
        player: {
          iconLabel: playerInfo.icon.label,
          color: playerInfo.color,
        },
        index,
      };
      newGroundData[y][x] = newObjMark;
    });

    setGroundData(newGroundData);

    return () => {
      setGroundData(null);
    };
  }, [groundInitialData, playerInitialData]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: '999',
        bgcolor: COLOR_LIST.DARK_GRAY,
        width: { xs: '95vw', md: '900px' },
        paddingBottom: '20px',
        height: 'fit-content',
        borderRadius: '10px',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '10px' }}>
        <Box sx={{ boxSizing: 'border-box', padding: '10px' }}>
          <Typography sx={{ fontSize: '14px' }}>{historyData.time}</Typography>
          <Box>
            <Typography sx={{ fontSize: '14px' }}>
              {historyData.gameCondition.ground} x {historyData.gameCondition.ground} GAME |{' '}
              {historyData.gameCondition.victoryCondition} BINGO
            </Typography>
            <Typography fontSize={20}>
              <span style={{ fontWeight: '600' }}>{historyData.players[0]?.name}</span>
              <span
                style={{
                  position: 'relative',
                  color: historyData.players[0]?.color,
                  marginLeft: '10px',
                  top: '2px',
                }}
              >
                {playerInitialData && playerInitialData[0]?.icon.label}
              </span>{' '}
              <span style={{ fontSize: '14px' }}>vs</span>{' '}
              <span style={{ fontWeight: '600' }}>{historyData.players[1]?.name}</span>
              <span
                style={{
                  position: 'relative',
                  color: historyData.players[1]?.color,
                  marginLeft: '10px',
                  top: '2px',
                }}
              >
                {playerInitialData && playerInitialData[1]?.icon.label}
              </span>
            </Typography>

            <Typography sx={{ fontSize: '24px', fontWeight: '600', color: COLOR_LIST.STRONG_PINK }}>
              WINNER: {historyData.players[historyData.winner]?.name}{' '}
              <span
                style={{
                  position: 'relative',
                  color: historyData.players[historyData.winner]?.color,
                  marginLeft: '5px',
                  top: '4px',
                }}
              >
                {playerInitialData && playerInitialData[historyData.winner]?.icon.label}
              </span>
            </Typography>
          </Box>
        </Box>
        <ImCancelCircle size={25} onClick={onClickCancel} style={{ cursor: 'pointer' }} />
      </Box>

      {!groundData ? (
        <Typography>오류: 다시 시도해주세요.</Typography>
      ) : (
        <Grid
          container
          sx={{
            width: { xs: '300px', sm: '400px', md: '500px' },
            height: { xs: '300px', sm: '400px', md: '500px' },
            position: 'relative',
            margin: 'auto',
          }}
        >
          <Grid xs={12}>
            {Object.keys(groundData).map((el: string, index: number) => {
              // 세로 끝 인덱스
              const lastIndex = Object.keys(groundData).length - 1;

              return (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    borderWidth: Number(el) !== 0 && Number(el) !== lastIndex ? '1px 0 1px 0' : '0',
                    borderColor: COLOR_LIST.WHITE,
                    borderStyle: 'solid',
                  }}
                >
                  {groundData[Number(el)].map(
                    (
                      playerMark: null | HistoryGroundDataIndividualType,
                      playerMarkIndex: number,
                    ) => {
                      // 가로 끝 인덱스
                      const lastMarkIndex = groundData[Number(el)].length - 1;
                      // 공통 값
                      const commonBorderWidth = '1px';

                      // 빙고 체크
                      const isBingo =
                        historyData.victoryPosition?.filter(
                          (el) => el[0] === playerMarkIndex && el[1] === index,
                        ).length === 0
                          ? false
                          : true;

                      return (
                        <Box
                          sx={{
                            flex: '1',
                            aspectRatio: '1/1',
                            width: '100%',
                            borderWidth:
                              groundData[Number(el)].length === 3 &&
                              playerMarkIndex !== 0 &&
                              playerMarkIndex !== lastMarkIndex
                                ? `0 ${commonBorderWidth} 0 ${commonBorderWidth}`
                                : groundData[Number(el)].length > 3 &&
                                    playerMarkIndex !== 0 &&
                                    playerMarkIndex !== lastMarkIndex
                                  ? `0 0 0 ${commonBorderWidth}`
                                  : groundData[Number(el)].length > 3 &&
                                      playerMarkIndex === lastMarkIndex
                                    ? `0 0 0 ${commonBorderWidth}`
                                    : '0',
                            borderColor: COLOR_LIST.WHITE,
                            borderStyle: 'solid',
                            cursor: 'pointer',
                            bgcolor: !isBingo ? COLOR_LIST.DARK_GRAY : COLOR_LIST.PINK,
                          }}
                          key={`${index}_${playerMarkIndex}`}
                        >
                          {playerMark === null ? (
                            ''
                          ) : (
                            <Box
                              color={playerMark.player?.color}
                              sx={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '10px',
                                svg: {
                                  viewBox: '0 0 100 100',
                                  width: '30%',
                                  height: 'auto',
                                },
                              }}
                            >
                              <Typography
                                component="span"
                                sx={{ fontSize: { xs: '10px', sm: '12px' } }}
                              >
                                {playerMark.index}
                              </Typography>{' '}
                              {playerMark.player.iconLabel}
                            </Box>
                          )}
                        </Box>
                      );
                    },
                  )}
                </Box>
              );
            })}
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default GameBoardPopup;
