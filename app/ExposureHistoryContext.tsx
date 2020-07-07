import React, {
  createContext,
  useState,
  useEffect,
  FunctionComponent,
} from 'react';

import * as BTNativeModule from './bt/nativeModule';
import {
  blankExposureHistory,
  ExposureHistory,
  ExposureCalendarOptions,
  ExposureInfo,
} from './exposureHistory';

interface ExposureHistoryState {
  lastExposureDetectionDate: string;
  exposureHistory: ExposureHistory;
  hasBeenExposed: boolean;
  userHasNewExposure: boolean;
  observeExposures: () => void;
  resetExposures: () => void;
}

const initialState = {
  lastExposureDetectionDate: '',
  exposureHistory: [],
  hasBeenExposed: false,
  userHasNewExposure: true,
  observeExposures: () => {},
  resetExposures: () => {},
};

const ExposureHistoryContext = createContext<ExposureHistoryState>(
  initialState,
);

type ExposureInfoSubscription = (
  cb: (exposureInfo: ExposureInfo) => void,
) => { remove: () => void };

export interface ExposureEventsStrategy {
  exposureInfoSubscription: ExposureInfoSubscription;
  toExposureHistory: (
    exposureInfo: ExposureInfo,
    calendarOptions: ExposureCalendarOptions,
  ) => ExposureHistory;
}

interface ExposureHistoryProps {
  exposureEventsStrategy: ExposureEventsStrategy;
}

const CALENDAR_DAY_COUNT = 21;

const blankHistoryConfig: ExposureCalendarOptions = {
  startDate: Date.now(),
  totalDays: CALENDAR_DAY_COUNT,
};

const blankHistory = blankExposureHistory(blankHistoryConfig);

const ExposureHistoryProvider: FunctionComponent<ExposureHistoryProps> = ({
  children,
  exposureEventsStrategy,
}) => {
  const {
    exposureInfoSubscription,
    toExposureHistory,
  } = exposureEventsStrategy;
  const [exposureHistory, setExposureHistory] = useState<ExposureHistory>(
    blankHistory,
  );
  const [userHasNewExposure, setUserHasNewExposure] = useState<boolean>(false);
  const [lastExposureDetectionDate, setLastExposureDetectionDate] = useState(
    '',
  );

  useEffect(() => {
    const subscription = exposureInfoSubscription(
      (exposureInfo: ExposureInfo) => {
        const exposureHistory = toExposureHistory(
          exposureInfo,
          blankHistoryConfig,
        );

        const handleNativeResponse = (detectionDate: string) => {
          console.log('Detection date: ', detectionDate);
          setLastExposureDetectionDate(detectionDate);
        };
        console.log('in context');
        BTNativeModule.getLastExposureDetectionDate(handleNativeResponse);
        setExposureHistory(exposureHistory);
      },
    );

    return subscription.remove;
  }, [exposureInfoSubscription, toExposureHistory]);

  const observeExposures = () => {
    setUserHasNewExposure(false);
  };

  const resetExposures = () => {
    setUserHasNewExposure(true);
  };

  const hasBeenExposed = false;
  return (
    <ExposureHistoryContext.Provider
      value={{
        lastExposureDetectionDate,
        exposureHistory,
        hasBeenExposed,
        userHasNewExposure,
        observeExposures,
        resetExposures,
      }}>
      {children}
    </ExposureHistoryContext.Provider>
  );
};

export { ExposureHistoryProvider };
export default ExposureHistoryContext;
