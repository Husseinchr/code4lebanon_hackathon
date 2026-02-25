import type {
  ApiEnvelope,
  Pagination,
  ResponseRecord,
  ResponsesListData,
  Survey,
} from "@/lib/types";
import { responsesFixture } from "@/data/fixtures/responses";
import { surveysFixture } from "@/data/fixtures/surveys";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API !== "false";
const EXTERNAL_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

function apiBase() {
  if (USE_MOCK) return "";
  return EXTERNAL_BASE.replace(/\/$/, "");
}

async function request<T>(path: string): Promise<T> {
  if (USE_MOCK) {
    throw new Error("request() should not be called in mock mode");
  }

  const res = await fetch(`${apiBase()}${path}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API request failed (${res.status}) for ${path}`);
  }

  const payload = (await res.json()) as ApiEnvelope<T>;
  return payload.data;
}

export async function getSurveys(): Promise<{ surveys: Survey[]; pagination: Pagination }> {
  if (USE_MOCK) {
    return {
      surveys: surveysFixture,
      pagination: {
        total: surveysFixture.length,
        page: 1,
        limit: 50,
        has_next_page: false,
      },
    };
  }
  return request<{ surveys: Survey[]; pagination: Pagination }>("/api/surveys");
}

export async function getSurveyById(id: string): Promise<{ survey: Survey }> {
  if (USE_MOCK) {
    const survey = surveysFixture.find((item) => item.id === id);
    if (!survey) throw new Error("Survey not found");
    return { survey };
  }
  return request<{ survey: Survey }>(`/api/surveys/${id}`);
}

export async function getSurveyBySlug(slug: string): Promise<{ survey: Survey }> {
  if (USE_MOCK) {
    const survey = surveysFixture.find((item) => item.slug === slug);
    if (!survey) throw new Error("Survey not found");
    return { survey };
  }
  return request<{ survey: Survey }>(`/api/surveys/slug/${slug}`);
}

export async function getResponses(params?: { surveyId?: string }): Promise<ResponsesListData> {
  if (USE_MOCK) {
    const filtered = params?.surveyId
      ? responsesFixture.filter((item) => item.survey_id === params.surveyId)
      : responsesFixture;
    return {
      responses: filtered,
      pagination: {
        total: filtered.length,
        page: 1,
        limit: 100,
        has_next_page: false,
      },
    };
  }

  const query = params?.surveyId ? `?survey_id=${encodeURIComponent(params.surveyId)}` : "";
  return request<ResponsesListData>(`/api/responses${query}`);
}

export async function getResponseById(id: string): Promise<{ response: ResponseRecord }> {
  if (USE_MOCK) {
    const response = responsesFixture.find((item) => item.id === id);
    if (!response) throw new Error("Response not found");
    return { response };
  }
  return request<{ response: ResponseRecord }>(`/api/responses/${id}`);
}

export async function getLastResponseDate(): Promise<{ last_response_date: string | null }> {
  if (USE_MOCK) {
    const sorted = [...responsesFixture].sort((a, b) => b.created_at.localeCompare(a.created_at));
    return { last_response_date: sorted[0]?.created_at ?? null };
  }
  return request<{ last_response_date: string | null }>("/api/responses/last-response-date");
}
