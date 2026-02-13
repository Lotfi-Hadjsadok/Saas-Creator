import Replicate from "replicate";

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

export const replicateRun = (model: `${string}/${string}`, data: Record<string, unknown>) =>
  replicate.run(model, { input: data });