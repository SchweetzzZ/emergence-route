import { ZodSchema } from "zod";
import { Body } from "@nestjs/common";
import { ZodValidationPipe } from "../pipe/zod-validation.pipe";

export const ZodBody = (schema: ZodSchema) => Body(new ZodValidationPipe(schema));