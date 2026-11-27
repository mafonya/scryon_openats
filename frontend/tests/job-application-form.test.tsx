import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { JobApplicationForm } from "@/app/careers/[id]/_components/job-application-form";
import type { JobDetail } from "@/types";

const job = { id: 42, title: "Engineer", employmentType: "full_time", location: null, salaryType: null, description: null } as JobDetail;
vi.mock("@/lib/api-url", () => ({ browserApiUrl: () => "http://api.example.test" }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function completeContact() {
  fireEvent.change(screen.getByPlaceholderText("First name"), { target: { value: "Ada" } });
  fireEvent.change(screen.getByPlaceholderText("Last name"), { target: { value: "Tester" } });
  fireEvent.change(screen.getByPlaceholderText("example@gmail.com"), { target: { value: "ada@example.test" } });
}

describe("applicant form", () => {
  it("submits contact details and shows confirmation", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: {} }) });
    vi.stubGlobal("fetch", fetchMock);
    render(<JobApplicationForm job={job} questions={[]} />);
    completeContact();
    fireEvent.click(screen.getByRole("button", { name: "Submit application" }));
    expect(await screen.findByText("Application submitted successfully.")).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0]).toBe("http://api.example.test/public/jobs/42/apply");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ firstName: "Ada", lastName: "Tester", email: "ada@example.test", customAnswers: [] });
  });
  it("shows duplicate-application errors without a success message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 409, json: async () => ({ code: "DUPLICATE_APPLICATION", error: "Already applied" }) }));
    render(<JobApplicationForm job={job} questions={[]} />);
    completeContact();
    fireEvent.click(screen.getByRole("button", { name: "Submit application" }));
    await waitFor(() => expect(screen.getByText("Already applied")).toBeTruthy());
    expect(screen.queryByText("Application submitted successfully.")).toBeNull();
  });
});
