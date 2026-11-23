// Cambiá esta dirección si tu backend utiliza otro puerto.
export const API_URL = "http://localhost:5001";
export const session = () =>
  JSON.parse(sessionStorage.getItem("techstore") || "null");

export async function api(path, method = "GET", body) {
  const headers = {};
  if (session()?.token) headers.Authorization = "Bearer " + session().token;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  let response;
  try {
    response = await fetch(API_URL + path, {
      method,
      headers,
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      "No se pudo conectar con la API. Revisá que esté encendida en " + API_URL,
    );
  }
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401 && session() && !path.endsWith("/login")) {
      sessionStorage.removeItem("techstore");
      throw new Error("La sesión venció. Volvé a iniciar sesión en Mi cuenta.");
    }
    throw new Error(
      data.mensaje || "La solicitud falló (" + response.status + ")",
    );
  }
  return data;
}
