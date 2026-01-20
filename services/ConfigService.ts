
export const ConfigService = {
  // TOGGLE THIS for Test Mode (Accelerated Time)
  TEST_MODE: true, 
  
  // FAKE GPS MODE:
  // TRUE = Use localStorage coordinates (Simulated movement)
  // FALSE = Use Real Device GPS (navigator.geolocation)
  // WARNING: If you set this to true, Real GPS is ignored!
  GPS_TEST_MODE: false,

  // GPS Configuration
  GPS_WATCH_ENABLED: true,
  GPS_HIGH_ACCURACY: true,
  GPS_TIMEOUT_MS: 15000, // 15 seconds wait for fix
  GPS_MAX_AGE_MS: 5000,  // Accept positions up to 5s old

  // Acceleration factor: 60 means 1 real second = 1 simulation minute.
  // 30 mins rule -> 30 seconds real time.
  TIME_SCALE: 60,

  /**
   * Convert logical minutes to real-world milliseconds duration.
   * Use this for setting timers, timeouts, or duration rules.
   * 
   * Example: 
   * ms(30) -> 30 "minutes"
   * Real Mode: returns 1,800,000 ms (30 mins)
   * Test Mode: returns 30,000 ms (30 secs)
   */
  ms: (minutes: number): number => {
    const realMs = minutes * 60 * 1000;
    if (ConfigService.TEST_MODE) {
      return realMs / ConfigService.TIME_SCALE;
    }
    return realMs;
  },

  /**
   * Returns how many milliseconds define an "hour" for salary calculation.
   * Used to accelerate salary accrual in test mode.
   * Real Mode: 3,600,000 ms
   * Test Mode: 60,000 ms (if scale is 60)
   */
  getHourMs: (): number => {
    return ConfigService.ms(60);
  }
};
