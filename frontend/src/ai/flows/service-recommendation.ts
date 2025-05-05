// src/ai/flows/service-recommendation.ts
'use server';
/**
 * @fileOverview An AI agent that provides service recommendations for a vehicle.
 *
 * - getServiceRecommendations - A function that returns service recommendations for a vehicle.
 * - ServiceRecommendationInput - The input type for the getServiceRecommendations function.
 * - ServiceRecommendationOutput - The return type for the getServiceRecommendations function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ServiceRecommendationInputSchema = z.object({
  make: z.string().describe('The make of the vehicle (e.g., Toyota).'),
  model: z.string().describe('The model of the vehicle (e.g., Yaris).'),
  year: z.number().describe('The year of the vehicle.'),
});
export type ServiceRecommendationInput = z.infer<typeof ServiceRecommendationInputSchema>;

const ServiceRecommendationOutputSchema = z.object({
  recommendations: z
    .string()
    .describe('A list of recommended services for the vehicle based on its make, model, and year.'),
});
export type ServiceRecommendationOutput = z.infer<typeof ServiceRecommendationOutputSchema>;

export async function getServiceRecommendations(input: ServiceRecommendationInput): Promise<ServiceRecommendationOutput> {
  return serviceRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'serviceRecommendationPrompt',
  input: {
    schema: z.object({
      make: z.string().describe('The make of the vehicle (e.g., Toyota).'),
      model: z.string().describe('The model of the vehicle (e.g., Yaris).'),
      year: z.number().describe('The year of the vehicle.'),
    }),
  },
  output: {
    schema: z.object({
      recommendations: z
        .string()
        .describe('A list of recommended services for the vehicle based on its make, model, and year.'),
    }),
  },
  prompt: `You are an expert auto mechanic. Based on the make, model and year of a vehicle, you provide a list of recommended services and potential issues.

  Make: {{{make}}}
  Model: {{{model}}}
  Year: {{{year}}}

  What are the recommended services and potential issues?`,
});

const serviceRecommendationFlow = ai.defineFlow<
  typeof ServiceRecommendationInputSchema,
  typeof ServiceRecommendationOutputSchema
>({
  name: 'serviceRecommendationFlow',
  inputSchema: ServiceRecommendationInputSchema,
  outputSchema: ServiceRecommendationOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
