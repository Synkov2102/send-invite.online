import assert from "node:assert/strict";
import { test } from "node:test";
import { getYandexMapsUrl } from "./invite-map";

test("map links reject lookalike domains and unsafe protocols", () => {
  for (const value of ["https://yandex.example.com/maps", "https://yandex.ru.evil.com/maps", "https://notyandex.ru/maps", "http://yandex.ru/maps", "https://yandex.ru/maps-fake", "javascript:alert(1)"]) {
    assert.equal(getYandexMapsUrl(value), null);
  }
});

test("map links accept official hosts and preserve map parameters", () => {
  for (const host of ["yandex.ru", "www.yandex.ru", "yandex.com", "yandex.kz", "yandex.by", "yandex.uz", "yandex.com.tr"]) {
    const value = `https://${host}/maps/?ll=30%2C60`;
    assert.equal(getYandexMapsUrl(value), value);
  }
});
