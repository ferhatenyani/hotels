"use client";

import { useState } from "react";

export default function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <section
      id="contact"
      className="bg-white px-4 sm:px-6 lg:px-10 py-20 md:py-[120px]"
    >
      <div className="max-w-[760px] mx-auto">
        <h2 className="font-display font-medium text-3xl sm:text-4xl lg:text-5xl tracking-tight text-ink mb-12 md:mb-16">
          Get in touch
        </h2>

        <form
          className="flex flex-col gap-10"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            <div className="flex flex-col gap-3">
              <label
                htmlFor="fullname"
                className="font-sans text-[11px] uppercase tracking-[0.18em] text-graybase"
              >
                Full name
              </label>
              <input
                type="text"
                id="fullname"
                required
                className="bg-transparent font-sans text-base text-ink outline-none border-b border-graybase/40 pb-3 focus:border-accent"
              />
            </div>
            <div className="flex flex-col gap-3">
              <label
                htmlFor="email"
                className="font-sans text-[11px] uppercase tracking-[0.18em] text-graybase"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                className="bg-transparent font-sans text-base text-ink outline-none border-b border-graybase/40 pb-3 focus:border-accent"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label
              htmlFor="subject"
              className="font-sans text-[11px] uppercase tracking-[0.18em] text-graybase"
            >
              Subject
            </label>
            <input
              type="text"
              id="subject"
              className="bg-transparent font-sans text-base text-ink outline-none border-b border-graybase/40 pb-3 focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-3">
            <label
              htmlFor="message"
              className="font-sans text-[11px] uppercase tracking-[0.18em] text-graybase"
            >
              Message
            </label>
            <textarea
              id="message"
              rows={3}
              className="bg-transparent font-sans text-base text-ink outline-none border-b border-graybase/40 pb-3 focus:border-accent resize-none"
            />
          </div>

          {!sent ? (
            <button
              type="submit"
              className="w-full bg-marine text-white font-display font-semibold text-sm tracking-wide rounded-[4px] py-4 transition-colors hover:bg-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
            >
              Send message
            </button>
          ) : (
            <p className="font-sans text-[15px] text-graybase">
              Thank you — your message is with us. We will write back within the
              day.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
