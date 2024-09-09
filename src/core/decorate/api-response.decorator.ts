import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

import { ResponseDto } from '@/common/dto/response.dto';

type ModelType = Type<any> | [Type<any>];

export function ApiResponseWithDto(
  model: ModelType,
  description: string = 'Operation successful',
  status: number = 200,
) {
  const isArray = Array.isArray(model);

  return applyDecorators(
    ApiExtraModels(ResponseDto, ...(isArray ? model : [model])),
    ApiResponse({
      status,
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseDto) },
          {
            properties: {
              data: isArray
                ? { type: 'array', items: { $ref: getSchemaPath((model as [Type<any>])[0]) } }
                : { $ref: getSchemaPath(model as Type<any>) },
            },
          },
        ],
      },
    }),
  );
}
