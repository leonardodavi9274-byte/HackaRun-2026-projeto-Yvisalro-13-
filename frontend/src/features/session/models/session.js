export const signedOut={authenticated:false};
export const isComplete=s=>Boolean(s?.authenticated&&s.onboarding?.status==="completed");
