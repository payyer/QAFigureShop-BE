import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from "@jest/globals";
import request from "supertest";
import app from "../app.js";
import { Product } from "../models/Product.js";
import { Voucher } from "../models/Voucher.js";

describe("POST /api/validate-checkout", () => {
  let productFindSpy: any;
  let voucherFindOneSpy: any;

  beforeEach(() => {
    productFindSpy = jest.spyOn(Product, "find");
    voucherFindOneSpy = jest.spyOn(Voucher, "findOne");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return 400 if cart is empty", async () => {
    const res = await request(app).post("/api/validate-checkout").send({
      items: [],
    });

    expect(res.statusCode).toEqual(400);
    // Flexible check for different Zod version messages
    expect(res.body.message).toMatch(/Validation Error/);
  });

  it("should return 404 if product does not exist", async () => {
    // Mock return empty array
    productFindSpy.mockResolvedValue([]);

    const res = await request(app)
      .post("/api/validate-checkout")
      .send({
        items: [{ productId: "507f1f77bcf86cd799439011", quantity: 1 }],
      });

    expect(res.statusCode).toEqual(404);
  });
});
