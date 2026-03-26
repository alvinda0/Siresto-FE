
export interface PinCheckResponse {
    success: boolean
    message: string
    data: {
        has_pin: boolean
    }
}

export interface PinActionResponse {
    success: boolean
    message: string
    data: {
        pin_exists: boolean
    }
}

export interface CreatePinPayload {
    pin: string
    password: string
}

export interface UpdatePinPayload {
    old_pin: string
    new_pin: string
    password: string
}

export interface DeletePinPayload {
    pin: string
    password: string
}

export interface ResetPinPayload {
    user_id: string
    reason: string
}

export interface ResetPinResponse {
    status: number
    success: boolean
    message: string
    data: {
        success: boolean
        message: string
        user_id: string
    }
}