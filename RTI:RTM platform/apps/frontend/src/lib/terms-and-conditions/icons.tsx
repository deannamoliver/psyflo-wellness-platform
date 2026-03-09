import type { SVGProps } from "react";

export function TermsConditions(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={14}
      height={19}
      fill="none"
      {...props}
    >
      <g clipPath="url(#a)">
        <path
          fill="#2563EB"
          d="M2.25.25A2.252 2.252 0 0 0 0 2.5V16a2.252 2.252 0 0 0 2.25 2.25h9A2.252 2.252 0 0 0 13.5 16V5.875H9A1.124 1.124 0 0 1 7.875 4.75V.25H2.25ZM9 .25v4.5h4.5L9 .25ZM2.812 2.5h2.25c.31 0 .563.253.563.563 0 .309-.253.562-.563.562h-2.25a.564.564 0 0 1-.562-.563c0-.309.253-.562.563-.562Zm0 2.25h2.25c.31 0 .563.253.563.563 0 .309-.253.562-.563.562h-2.25a.564.564 0 0 1-.562-.563c0-.309.253-.562.563-.562Zm1.906 8.923a1.689 1.689 0 0 1-1.617 1.202h-.288a.564.564 0 0 1-.563-.563c0-.309.253-.562.563-.562H3.1c.25 0 .467-.162.538-.4l.523-1.741a.938.938 0 0 1 1.8 0l.408 1.357a1.474 1.474 0 0 1 2.26.475l.156.309h1.902c.309 0 .562.253.562.563 0 .309-.253.562-.563.562h-2.25a.56.56 0 0 1-.502-.31l-.31-.622a.346.346 0 0 0-.309-.193.342.342 0 0 0-.31.193l-.309.623a.56.56 0 0 1-1.04-.088l-.595-1.958-.344 1.153Z"
        />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M0 .25h13.5v18H0v-18Z" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function ClickbackArrow(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={14}
      fill="none"
      {...props}
    >
      <path
        fill="#4B5563"
        d="M.33 6.456c-.44.44-.44 1.153 0 1.593l5.625 5.625a1.127 1.127 0 0 0 1.592-1.593L3.838 8.376h10.786a1.124 1.124 0 1 0 0-2.25H3.842L7.544 2.42A1.127 1.127 0 0 0 5.95.828L.326 6.453l.004.003Z"
      />
    </svg>
  );
}

export function Checkmark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={14}
      height={16}
      fill="none"
      {...props}
    >
      <g clipPath="url(#a)">
        <path
          fill="#22C55E"
          d="M13.707 3.293c.39.39.39 1.025 0 1.416l-8 8c-.391.39-1.025.39-1.416 0l-4-4a1.002 1.002 0 0 1 1.416-1.416L5 10.583l7.294-7.29c.39-.39 1.025-.39 1.416 0h-.003Z"
        />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M0 0h14v16H0V0Z" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function RightArrow(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={12}
      height={12}
      fill="none"
      {...props}
    >
      <path
        fill="currentColor"
        d="M13.706 8.707c.39-.391.39-1.025 0-1.416l-5-5a1.002 1.002 0 0 0-1.415 1.416L10.587 7H1a.999.999 0 1 0 0 2h9.584l-3.29 3.294a1.002 1.002 0 0 0 1.415 1.416l5-5-.003-.003Z"
      />
    </svg>
  );
}

export function MedicalDisclaimer(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <path
        fill="#D97706"
        d="M10 2c.5 0 .96.264 1.213.696l7.594 12.938a1.404 1.404 0 0 1-1.213 2.116H2.407c-.503 0-.97-.27-1.22-.707a1.412 1.412 0 0 1 .007-1.41L8.788 2.822A1.403 1.403 0 0 1 10 2Zm0 4.5a.842.842 0 0 0-.843.844v3.937c0 .468.376.844.844.844a.842.842 0 0 0 .843-.844V7.47a.842.842 0 0 0-.843-.844Zm1.126 7.875a1.125 1.125 0 1 0-2.25 0 1.125 1.125 0 0 0 2.25 0Z"
      />
    </svg>
  );
}

export function BulletPoint() {
  return (
    <span className="inline-block h-2 w-2 rounded-full border border-[#717680] bg-[#717680] align-middle" />
  );
}

export function Email(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      fill="none"
      {...props}
    >
      <path stroke="#E5E7EB" d="M16 16H0V0h16v16Z" />
      <path
        fill="#1849A9"
        d="M1.5 2a1.5 1.5 0 0 0-.9 2.7l6.8 5.1c.356.266.844.266 1.2 0l6.8-5.1a1.5 1.5 0 0 0-.9-2.7h-13ZM0 5.5V12c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2V5.5l-6.8 5.1a1.997 1.997 0 0 1-2.4 0L0 5.5Z"
      />
    </svg>
  );
}
