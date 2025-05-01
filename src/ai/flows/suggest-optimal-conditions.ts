'use server';

/**
 * @fileOverview AI-powered tool that suggests optimal conditions for produce based on type, origin, weather, and agricultural data.
 *
 * - suggestOptimalConditions - A function that handles the suggestion of optimal conditions for produce.
 * - SuggestOptimalConditionsInput - The input type for the suggestOptimalConditions function.
 * - SuggestOptimalConditionsOutput - The return type for the suggestOptimalConditions function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {getWeather, Location} from '@/services/weather';
import {getAgriculturalData} from '@/services/agricultural-data';

const SuggestOptimalConditionsInputSchema = z.object({
  produceType: z.string().describe('The type of produce (e.g., tomatoes, lettuce).'),
  origin: z.string().describe('The origin of the produce (e.g., farm name, region).'),
  location: z
    .object({
      lat: z.number().describe('Latitude of the produce origin.'),
      lng: z.number().describe('Longitude of the produce origin.'),
    })
    .describe('The geographic location of the produce origin.'),
});
export type SuggestOptimalConditionsInput = z.infer<typeof SuggestOptimalConditionsInputSchema>;

const SuggestOptimalConditionsOutputSchema = z.object({
  wateringSchedule: z.string().describe('Suggested watering schedule for the produce.'),
  pestControl: z.string().describe('Suggested pest control measures for the produce.'),
  soilPhRecommendation: z.string().describe('The recommended soil pH level for the crop.'),
  fertilizerRecommendation: z.string().describe('The recommended fertilizer for the crop.'),
});
export type SuggestOptimalConditionsOutput = z.infer<typeof SuggestOptimalConditionsOutputSchema>;

export async function suggestOptimalConditions(input: SuggestOptimalConditionsInput): Promise<SuggestOptimalConditionsOutput> {
  return suggestOptimalConditionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimalConditionsPrompt',
  input: {
    schema: z.object({
      produceType: z.string().describe('The type of produce (e.g., tomatoes, lettuce).'),
      origin: z.string().describe('The origin of the produce (e.g., farm name, region).'),
      weatherConditions: z.string().describe('The current weather conditions at the origin.'),
      temperatureCelsius: z.number().describe('The current temperature in Celsius at the origin.'),
      soilPh: z.number().describe('The recommended soil pH level for the crop.'),
      recommendedFertilizer: z.string().describe('The recommended fertilizer for the crop.'),
    }),
  },
  output: {
    schema: z.object({
      wateringSchedule: z.string().describe('Suggested watering schedule for the produce.'),
      pestControl: z.string().describe('Suggested pest control measures for the produce.'),
    }),
  },
  prompt: `You are an AI assistant designed to provide optimal growing conditions for various types of produce.

  Based on the produce type, origin, current weather conditions, and agricultural data, suggest the best watering schedule and pest control measures.

  Produce Type: {{{produceType}}}
  Origin: {{{origin}}}
  Weather Conditions: {{{weatherConditions}}} at {{{temperatureCelsius}}} degrees Celsius
  Recommended Soil pH: {{{soilPh}}}
  Recommended Fertilizer: {{{recommendedFertilizer}}}

  Provide specific and actionable advice to the farmer.
  `,
});

const suggestOptimalConditionsFlow = ai.defineFlow<
  typeof SuggestOptimalConditionsInputSchema,
  typeof SuggestOptimalConditionsOutputSchema
>(
  {
    name: 'suggestOptimalConditionsFlow',
    inputSchema: SuggestOptimalConditionsInputSchema,
    outputSchema: SuggestOptimalConditionsOutputSchema,
  },
  async input => {
    const {produceType, origin, location} = input;

    // Get weather data
    const weather = await getWeather(location as Location);

    // Get agricultural data
    const agriculturalData = await getAgriculturalData(produceType, origin);

    const {output} = await prompt({
      produceType,
      origin,
      weatherConditions: weather.conditions,
      temperatureCelsius: weather.temperatureCelsius,
      soilPh: agriculturalData.soilPh,
      recommendedFertilizer: agriculturalData.recommendedFertilizer,
    });

    return {
      ...output!,
      soilPhRecommendation: `Recommended soil pH: ${agriculturalData.soilPh}`,
      fertilizerRecommendation: `Recommended fertilizer: ${agriculturalData.recommendedFertilizer}`,
    };
  }
);
