// lunar-javascript는 타입 미제공(교차검증 전용). 앰비언트 선언으로 처리.
declare module "lunar-javascript" {
  export const Solar: {
    fromYmdHms: (
      y: number,
      m: number,
      d: number,
      h: number,
      mi: number,
      s: number,
    ) => {
      getLunar: () => {
        getEightChar: () => {
          setSect: (n: number) => void;
          getYear: () => string;
          getMonth: () => string;
          getDay: () => string;
          getTime: () => string;
        };
      };
    };
  };
}
