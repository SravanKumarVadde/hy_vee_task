import axios, { AxiosError, AxiosResponse } from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

interface NameType {
  count: number;
  name: string;
}

type AgeType = {
  age: number;
} & NameType;

type GenderType = {
  gender: string;
} & NameType;

type CountryType = {
  country: { country_id: string; probability: number }[];
} & NameType;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const name = req.query?.name || "";
      if (name) {
        const ageRequest: Promise<AgeType | null> = axios(
          `https://api.agify.io?name=${name}`
        )
          .then((resp: AxiosResponse<AgeType>) => resp?.data)
          .catch((err: AxiosError) => {
            console.log("Error while age request", err);
            return null;
          });
        const genderRequest: Promise<GenderType | null> = axios(
          `https://api.genderize.io?name=${name}`
        )
          .then((resp: AxiosResponse<GenderType>) => resp?.data)
          .catch((err: AxiosError) => {
            console.log("Error while gender request", err);
            return null;
          });
        const countryRequest: Promise<CountryType | null> = axios(
          `https://api.nationalize.io?name=${name}`
        )
          .then((resp: AxiosResponse<CountryType>) => resp?.data)
          .catch((err: AxiosError) => {
            console.log("Error while contry request", err);
            return null;
          });

        const [ageResponse, genderResponse, countryResponse] =
          await Promise.allSettled([ageRequest, genderRequest, countryRequest]);

        res.status(200).json({
          name,
          age: ageResponse.status === "fulfilled" ? ageResponse.value?.age : "",
          gender:
            genderResponse.status === "fulfilled"
              ? genderResponse.value?.gender
              : "",
          country:
            countryResponse.status === "fulfilled"
              ? countryResponse.value?.country
              : [],
        });
      } else {
        res.status(400).json({ message: "Please provide name" });
      }
    } catch (err) {
      console.log("Error occured", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    res.status(404).json({ message: "Request not found" });
  }
}
