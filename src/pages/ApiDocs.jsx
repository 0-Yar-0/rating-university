import React from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

const OPENAPI_URL = import.meta.env.VITE_OPENAPI_URL || '/openapi.json';

export default function ApiDocsPage() {
    return (
        <section className="docs-page">
            <div className="docs-card card">
                <div className="docs-hero">
                    <p className="docs-kicker">OpenAPI / Swagger UI</p>
                    <h1>Документация API</h1>
                    <p className="docs-subtitle">
                        Тут описаны авторизация, загрузка параметров, расчёт рейтинга и история.
                        Запросы используют cookie-сессию (credentials=include).
                    </p>
                </div>
                <div className="docs-meta">
                    <span>docs available at <strong>{OPENAPI_URL}</strong></span>
                    <span className="docs-note">Сессии хранятся в cookie: sessionCookie</span>
                </div>
                <div className="swagger-wrapper">
                    <SwaggerUI
                        url={OPENAPI_URL}
                        docExpansion="list"
                        defaultModelsExpandDepth={-1}
                        deepLinking={true}
                    />
                </div>
            </div>
        </section>
    );
}
