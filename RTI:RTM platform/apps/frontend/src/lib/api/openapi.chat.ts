/**
 * OpenAPI schema for the FastAPI chat backend
 * This provides type safety for API calls using openapi-fetch
 */

export interface paths {
  "/health": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": {
              status: string;
              resource_id: string;
            };
          };
        };
      };
    };
  };
  "/api/sessions/{user_id}": {
    post: {
      parameters: {
        path: {
          user_id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": {
              id: string;
              title: string;
            };
          };
        };
        500: {
          content: {
            "application/json": {
              detail: string;
            };
          };
        };
      };
    };
    get: {
      parameters: {
        path: {
          user_id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Array<{
              id: string;
              title: string;
            }>;
          };
        };
        500: {
          content: {
            "application/json": {
              detail: string;
            };
          };
        };
      };
    };
  };
  "/api/sessions/{user_id}/{session_id}": {
    get: {
      parameters: {
        path: {
          user_id: string;
          session_id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": {
              id: string;
              messages: Array<{
                id: string;
                content: string;
                role: string;
              }>;
            };
          };
        };
        404: {
          content: {
            "application/json": {
              detail: string;
            };
          };
        };
      };
    };
    post: {
      parameters: {
        path: {
          user_id: string;
          session_id: string;
        };
      };
      requestBody: {
        content: {
          "application/json": {
            message: string;
          };
        };
      };
      responses: {
        200: {
          content: {
            "application/json": {
              id: string;
              content: string;
              role: string;
            };
          };
        };
        500: {
          content: {
            "application/json": {
              detail: string;
            };
          };
        };
      };
    };
  };
}

export interface components {
  schemas: {
    Message: {
      id: string;
      content: string;
      role: string;
    };
    MessageRequest: {
      message: string;
    };
    SessionResponse: {
      id: string;
      messages: components["schemas"]["Message"][];
    };
    HealthResponse: {
      status: string;
      resource_id: string;
    };
  };
}
