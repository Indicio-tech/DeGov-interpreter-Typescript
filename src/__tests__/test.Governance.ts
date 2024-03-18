import { GovernanceFile } from "../types/Governance"

export const governance: GovernanceFile = {
  "@context": [
    "https://github.com/hyperledger/aries-rfcs/blob/main/concepts/0430-machine-readable-governance-frameworks/context.jsonld",
  ],
  author: "did:example:viacheslavnazarenko",
  name: "Proven Ecosystem Governance",
  version: "0.1",
  format: "1.0",
  id: "c64846d1-cf60-4ac5-835e-cbd25569f2fa",
  uri: "htpps://degov.com/proven.json",
  ttl: 300,
  description:
    "This document describes email and employment governance in a machine readable way",
  last_updated: 1673307432,
  docs_uri: "https://url-for-docs...",
  schemas: [
    {
      id: "BXtzYPyPdiVKGAjkqtPexs:2:Email:1.0",
      name: "Email Credential Issuer",
      issuer_roles: ["email_issuer"],
      verifier_roles: ["email_verifier"],
    },
    {
      id: "QHqtjywxfP3yYsFrRHFLQm:2:Employment:1.0",
      name: "Employment Credential Issuer",
      issuer_roles: ["employment_issuer"],
      verifier_roles: ["employment_verifier"],
    },
  ],
  participants: {
    id: "1e762324-6a45-4f6a-b124-ecb21190fe09",
    author: "did:example:viacheslavnazarenko",
    created: 1673307432,
    version: 2,
    topic: "uri:to-multi-topic-schema",
    entries: {
      "https://example.com/roles.schema.json": {
        U9FXudo8rdCgsrpQ5EG2YY: {
          roles: ["email_issuer", "employment_issuer"],
        },
        WdvgJP7fwfvCrKupRRhDEu: {
          roles: ["email_verifier", "employment_verifier"],
        },
      },
      "https://example.com/description.schema.json": {
        U9FXudo8rdCgsrpQ5EG2YY: {
          name: "Proven issuer agency",
          website: "issuinggovernmentsite.org",
          email: "credential_manager@issuinggovernmentsite.org",
          phone: "123-456-6780",
        },
        WdvgJP7fwfvCrKupRRhDEu: {
          name: "Proven verifier agency",
          website: "verifyinglabsite.com",
          email: "credential_manager@verifyinglabsite.com",
          phone: "098-765-4321",
        },
      },
    },
  },
  roles: {
    role_1: {
      issue: ["QHqtjywxfP3yYsFrRHFLQm:2:Employment:1.0", ""],
      verify: ["", ""],
    },
    role_2: {
      issue: ["BXtzYPyPdiVKGAjkqtPexs:2:Email:1.0"],
      granted_by: "presentation_definition_file_to_describe_proof",
    },
    role_3: {
      verify: ["BXtzYPyPdiVKGAjkqtPexs:2:Email:1.0"],
    },
  },
}

export const jwtGovernance = {
  governance:
    "eyJ0eXAiOiAiSldUIiwgImFsZyI6ICJFZERTQSIsICJraWQiOiAiZGlkOnNvdjpDdThIRVh1N2NLNHhoRzVDMXlITVdDI2tleS0xIn0.eyJhdXRob3IiOiAiZGlkOmV4YW1wbGU6cm91bmQtbi1wcm91ZCIsICJkZXNjcmlwdGlvbiI6ICJTZWxlY3RlZCBzY2hlbWFzIGFuZCB0cnVzdGVkIGlzc3VlcnMgZm9yIHRoZSBuYXRpb24gb2YgJ2NvdW50cnknIiwgImRvY3NfdXJpIjogImh0dHBzOi8vY291bnRyeS5nb3YvaGVhbHRoLzIwMjItaGVhbHRoLXN0YW5kYXJkcy9pbmRleC5odG1sIiwgImZvcm1hdCI6ICIxLjAiLCAiaWQiOiAiOWRmYTcyYmItMmVlZS00NjgwLTliMjQtNGUwMDI0MGRmZWU3IiwgImxhc3RfdXBkYXRlZCI6IDE3MDc0MzEwNTYsICJuYW1lIjogIkNvdW50cnkgSGVhbHRoIEdvdmVybmFuY2UiLCAidmVyc2lvbiI6IDYsICJ1cmkiOiAiaHR0cHM6Ly9sb2NhbGhvc3Q6MzEwMC9hcGkvdjEvZ292ZXJuYW5jZS9kZWdvdi5qc29uIiwgImN1cnJlbnRfdmVyc2lvbiI6ICJodHRwczovL2xvY2FsaG9zdDozMTAwL2FwaS92MS9nb3Zlcm5hbmNlLzYuanNvbiIsICJwcmV2aW91c192ZXJzaW9ucyI6IFt7InZlcnNpb24iOiAxLCAidXJpIjogImh0dHBzOi8vZ292ZXJuYW5jZS1maWxlcy0yLnMzLnVzLXdlc3QtMi5hbWF6b25hd3MuY29tL3Byb3Zlbi8xLmpzb24ifSwgeyJ2ZXJzaW9uIjogMiwgInVyaSI6ICJodHRwczovL2dvdmVybmFuY2UtZmlsZXMtMi5zMy51cy13ZXN0LTIuYW1hem9uYXdzLmNvbS9wcm92ZW4vMi5qc29uIn0sIHsidmVyc2lvbiI6IDMsICJ1cmkiOiAiaHR0cHM6Ly9nb3Zlcm5hbmNlLWZpbGVzLTIuczMudXMtd2VzdC0yLmFtYXpvbmF3cy5jb20vcHJvdmVuLzMuanNvbiJ9LCB7InZlcnNpb24iOiA0LCAidXJpIjogImh0dHBzOi8vbG9jYWxob3N0OjMxMDAvYXBpL3YxL2dvdmVybmFuY2UvNC5qc29uIn0sIHsidmVyc2lvbiI6IDUsICJ1cmkiOiAiaHR0cHM6Ly9sb2NhbGhvc3Q6MzEwMC9hcGkvdjEvZ292ZXJuYW5jZS81Lmpzb24ifV0sICJAY29udGV4dCI6IFsiaHR0cHM6Ly9naXRodWIuY29tL2h5cGVybGVkZ2VyL2FyaWVzLXJmY3MvYmxvYi9tYWluL2NvbmNlcHRzLzA0MzAtbWFjaGluZS1yZWFkYWJsZS1nb3Zlcm5hbmNlLWZyYW1ld29ya3MvY29udGV4dC5qc29ubGQiXSwgInNjaGVtYXMiOiBbXSwgInBhcnRpY2lwYW50cyI6IHsiaWQiOiAiZGVmYXVsdF9wYXJ0aWNpcGFudHNfdXVpZCIsICJhdXRob3IiOiAiZGlkOmV4YW1wbGU6cm91bmQtbi1wcm91ZCIsICJjcmVhdGVkIjogMTcwNzQzMTA1NiwgInZlcnNpb24iOiAxLCAidG9waWMiOiAiTm8gdG9waWMgcHJvdmlkZWQiLCAiZW50cmllcyI6IHsiaHR0cHM6Ly9leGFtcGxlLmNvbS9yb2xlcy5zY2hlbWEuanNvbiI6IHt9LCAiaHR0cHM6Ly9leGFtcGxlLmNvbS9kZXNjcmlwdGlvbi5zY2hlbWEuanNvbiI6IHt9fX0sICJyb2xlcyI6IHt9fQ.ICLx-bmyZ0-JOUVCOn_kN-gVu08p1VfwY_z_OrMyOUVSuAYtnzyN1J4dQscl8M4cw16GdZuOqn6aPiwRneJVBw",
}
