class ApiResponse {
  static success(data, message = 'Success', statusCode = 200) {
    return {
      statusCode,
      success: true,
      message,
      data,
    };
  }

  static error(message = 'Error', statusCode = 500, errors = null) {
    return {
      statusCode,
      success: false,
      message,
      errors,
    };
  }

  static paginated(data, total, page, limit) {
    return {
      statusCode: 200,
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = ApiResponse;
