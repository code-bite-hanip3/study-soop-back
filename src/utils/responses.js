// success: { success: true, data: {...}, message: "..." }
// failure: { success: false, message: "..." }  (error-handler가 처리)
export const success = (res, { status = 200, data, message = null }) => {
  return res.status(status).json({
    success: true,
    data,
    message,
  });
};

export const fail = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message,
  });
};