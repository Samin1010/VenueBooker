import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { UserPreference } from "../entity/UserPreference";
import { Venue } from "../entity/Venue";
import { Application } from "../entity/Application";
import { FileType, UserDocument } from "../entity/UserDocument";
import { sendError, sendSuccess } from "../types/responses";
import { Review } from "../entity/Review";
import type { ApiResponse, UserPreferenceDto } from "@shared/types";
import type { HirerHistoryPayload, PreferencePayload, PreferencesPayload, RankCheckingPayload, UserDocumentPayload, UserDocumentsPayload, UserPayload, VendorHistoryPayload } from "@shared/types/user_payload";
export class UserController {
    // Repository instances for database operations on User, Venue, and UserPreference entities
    private userRepository = AppDataSource.getRepository(User);
    private venueRepository = AppDataSource.getRepository(Venue);
    private userPreferenceRepository = AppDataSource.getRepository(UserPreference);
    private userDocumentRepository = AppDataSource.getRepository(UserDocument);
    private reviewRepository = AppDataSource.getRepository(Review);
    private isGreaterThan2MB(base64String: string) {
        // Remove metadata if present
        // Example: "data:image/png;base64,....."
        const base64 = base64String.split(",")[1] || base64String;
        // Calculate original file size in bytes
        const sizeInBytes = (base64.length * 3) / 4
            - (base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0);
        const twoMB = 2 * 1024 * 1024;
        return sizeInBytes > twoMB;
    }
    private async getValidHirer(userId_: string, userId: string | number, res: Response) {
        const user = await this.userRepository.findOne({
            where: { id: Number(userId_) }
        });
        if (!user) {
            sendError(res, 404, "NOT_FOUND", "The user does not exist");
            return null;
        }
        if (Number(userId_) !== Number(userId)) {
            sendError(res, 403, "FORBIDDEN", "Other users cannot upload files for other users");
            return null;
        }
        return user;
    }

    async updateUserDocumentFile(req : Request, res : Response<ApiResponse<UserDocumentPayload>>) {
        try
        {
            const userId_ = req.params.userId_;
            const document_id = req.params.document_id;

            const { userId, file, file_name, file_extension_type, file_type } = req.body;
            const user = await this.getValidHirer(userId_,userId, res);
            if(!user)
            {
                return;
            }

            const userDocument : UserDocument | null = await this.userDocumentRepository.findOne({
                where: {
                    id: Number(document_id),
                    user: {
                        id: Number(userId_)
                    }
                }
            });

            if (!userDocument) {
                return sendError(
                    res,
                    404,
                    "NOT_FOUND",
                    "User document not found"
                );
            }

            if (this.isGreaterThan2MB(file)) {
                return sendError(
                    res,
                    400,
                    "BAD_REQUEST",
                    "File is greater than 2 MB"
                );
            }

            userDocument.data = file;
            userDocument.file_name = file_name;
            userDocument.file_extension_type = file_extension_type;
            userDocument.file_type = file_type;
            userDocument.user = user;
            userDocument.userId = user.id;
            const updatedDocument = await this.userDocumentRepository.save(userDocument);

            return sendSuccess(
                res,
                {
                    document: updatedDocument
                },
                "File updated successfully"
            );

        }
        catch (error: unknown) {
            return sendError(res, 500, "INTERNAL_SERVER_ERROR", error instanceof Error ? error.message : String(error));
        }
    }
    async uploadUserDocumentFile(req: Request, res: Response<ApiResponse<UserDocumentPayload>>) {
        try {
            const userId_ = req.params.userId_;
            const { userId, file, file_name, file_extension_type, file_type } = req.body;
            const user = await this.getValidHirer(userId_, userId, res);
            if (!user)
                return;
            if (this.isGreaterThan2MB(file)) {
                return sendError(res, 400, "BAD_REQUEST", "File is greater than 2 MB");
            }
            const userDocument = new UserDocument();
            userDocument.data = file;
            userDocument.file_name = file_name;
            userDocument.file_extension_type = file_extension_type;
            userDocument.file_type = file_type;
            userDocument.user = user;
            userDocument.userId = user.id;
            await this.userDocumentRepository.save(userDocument);
            return sendSuccess(res, {
                document: userDocument
            }, "File uploaded successfully");
        }
        catch (error: unknown) {
            return sendError(res, 500, "INTERNAL_SERVER_ERROR", error instanceof Error ? error.message : String(error));
        }
    }
    async getUser(req: Request, res: Response<ApiResponse<UserPayload>>) {
        try {
            const userId = req.params.userId;
            const user: User | null = await this.userRepository.findOne({
                where: {
                    id: Number(userId)
                }
            });
            if (!user) {
                return sendError(res, 404, "NOT_FOUND", "There is no user which exists with id");
            }
            return sendSuccess(res, {
                user
            }, "Successfully retrived the user");
        }
        catch (error: unknown) {
            if (error instanceof Error) {
                return sendError(res, 500, "INTERNAL_SERVER_ERROR", error.message);
            }
            return sendError(res, 500, "INTERNAL_SERVER_ERROR", String(error));
        }
    }
    async getUserDocuments(req: Request, res: Response<ApiResponse<UserDocumentsPayload>>) {
        try {
            const userId = req.params.userId;
            const user: User | null = await this.userRepository.findOne({
                where: {
                    id: Number(userId)
                }
            });
            if (!user) {
                return sendError(res, 404, "NOT_FOUND", "There is no user found with this userId");
            }
            const hirerDocuments: UserDocument[] = await this.userDocumentRepository.find({
                where: {
                    userId: Number(userId)
                }
            });
            return sendSuccess(res, {
                documents: hirerDocuments
            }, "Successfully found the hirer's Document");
        }
        catch (error: unknown) {
            // Handle errors, check if it's an instance of Error
            if (error instanceof Error) {
                return sendError(res, 500, "INTERNAL_SERVER_ERROR", error.message);
            }
            // Fallback error handling
            return sendError(res, 500, "INTERNAL_SERVER_ERROR", String(error));
        }
    }
    // Method to change the user details of a user
    async changeUser(req: Request, res: Response<ApiResponse<UserPayload>>) {
        try {
            // Extract user ID from request parameters
            const userId_ = req.params.userId_;
            // Extract new username from request body
            const { username, first_name , last_name, email, phone, userId } = req.body;
            // Find the user by ID in the database
            const user: User | null = await this.userRepository.findOne({
                where: {
                    id: Number(userId_)
                }
            });
            const userSender: User | null = await this.userRepository.findOne({
                where: {
                    id: Number(userId)
                }
            });
            // If user not found, return error response
            if (!user) {
                return sendError(res, 400, "BAD_REQUEST", "There does not exists user with this");
            }
            // only user can change its preference so need to check whether they match or not
            if (!userSender || userSender.id !== user.id) {
                return sendError(res, 403, "FORBIDDEN", "Other users cannot change other user's name");
            }
            // Function to validate if the name contains only letters
            const isValidName = (name: string) => {
                return /^[A-Za-z]+$/.test(name);
            };

            const isValidUsername = (username: string) => {
                return /^[A-Za-z0-9._-]{3,30}$/.test(username);
            };
            // Check if the firstname is valid
            if (first_name !== undefined && !isValidName(first_name)) {
                return sendError(res, 400, "BAD_REQUEST", "is not a valid first name");
            }
            if (first_name !== undefined) {
                user.first_name = first_name;
            }

            if (last_name !== undefined && !isValidName(last_name)) {
                return sendError(res, 400, "BAD_REQUEST", "is not a valid last name");
            }
            if (last_name !== undefined) {
                user.last_name = last_name;
            }

            if(username !== undefined && !isValidUsername(username))
            {
                return sendError(res,400,"BAD_REQUEST","is not a valid username");
            }

            if (username !== undefined) {
                user.username = username;
            }

            // Function to validate email format using regex
            const isValidEmail = (email: string) => {
                // Regex pattern: [anything except @]@[anything except @].[anything except @]
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            };
            // Check if the email is valid
            if (email !== undefined && !isValidEmail(email)) {
                return sendError(res, 400, "BAD_REQUEST", "Is not a Valid email");
            }
            if (email !== undefined) {
                user.email = email;
            }
            // Function to validate phone number (must be exactly 10 digits)
            const isValidPhoneNumber = (number: string) => {
                return /^\d{10}$/.test(number);
            };
            // Check if phone is provided and valid
            if (phone && !isValidPhoneNumber(phone)) {
                return sendError(res, 400, "BAD_REQUEST", "is not a valid phone number");
            }
            // Update the user's phone number
            if (phone !== undefined) {
                user.phone = phone;
            }
            // Save the updated user to the database
            await this.userRepository.save(user);
            // Return success response with updated user data
            return sendSuccess(res, {
                user
            }, "Successfully updated the username");
        }
        catch (error: unknown) {
            // Handle errors, check if it's an instance of Error
            if (error instanceof Error) {
                return sendError(res, 500, "INTERNAL_SERVER_ERROR", error.message);
            }
            // Fallback error handling
            return sendError(res, 500, "INTERNAL_SERVER_ERROR", String(error));
        }
    }
    async canAssignPreferenceRank(req: Request, res: Response<ApiResponse<RankCheckingPayload>>) 
    {
        try {
            const userId = Number(req.params.userId);
            const venueId = Number(req.params.venueId);
            const newRank = Number(req.query.rank);

            if (!userId || !venueId || !newRank) {
                return sendError(res, 400, "BAD_REQUEST", "userId, venueId and rank are required");
            }

            const user = await this.userRepository.findOne({
                where: { id: userId }
            });

            if (!user) {
                return sendError(res, 404, "NOT_FOUND", "User not found");
            }

            if (user.role === "vendor") {
                return sendError(res, 403, "FORBIDDEN", "Vendors cannot have preferences");
            }

            const venue : Venue | null = await this.venueRepository.findOne({
                where : {
                    id : Number(venueId)
                }
            });

            if(!venue)
            {
                return sendError(res, 404, "NOT_FOUND", "Venue not found");
            }

            const currentPreference = await this.userPreferenceRepository.findOne({
                where: {
                    user: { id: userId },
                    venue: { id: venueId }
                }
            });

            const preferencesWithoutCurrent = await this.userPreferenceRepository.find({
                where: {
                    user: { id: userId }
                }
            });

            const filteredPreferences = preferencesWithoutCurrent.filter(
                pref => pref.id !== currentPreference?.id
            );

            const maxAllowedRank = filteredPreferences.length + 1;

            if (newRank < 1 || newRank > maxAllowedRank) {
                return sendSuccess(res, {
                    allowed: false,
                    maxAllowedRank,
                    currentRank: currentPreference?.pref_no ?? null
                }, "Rank is not allowed");
            }

            return sendSuccess(res, {
                allowed: true,
                maxAllowedRank,
                currentRank: currentPreference?.pref_no ?? null
            }, "Rank is allowed");

        } catch (error) {
            if (error instanceof Error) {
                return sendError(res, 500, "INTERNAL_SERVER_ERROR", error.message);
            }

            return sendError(res, 500, "INTERNAL_SERVER_ERROR", String(error));
        }
    }

    async getAllPreferences(req: Request, res: Response<ApiResponse<PreferencesPayload>>) {
        try {
            const userId_ = req.params.userId_;
            const user = await this.userRepository.findOne({
                where: {
                    id: Number(userId_)
                }
            });
            if (!user) {
                return sendError(res, 404, "NOT_FOUND", "There is no user with this id");
            }
            if (user.role === "vendor") {
                return sendError(res, 403, "FORBIDDEN", "Vendors do not have any preference");
            }
            const preferences: UserPreference[] = await this.userPreferenceRepository
                .createQueryBuilder("preference")
                .where("preference.user.id = :userId", { userId: userId_ })
                .getMany();
            
            //const preferencesWithoutUser = preferences.map(({ user, ...preference }) => preference);
            return sendSuccess(res, {
                preferences : preferences
            }, "Successfully got all the preferences");
        }
        catch (error) {
            // Handle errors
            if (error instanceof Error) {
                return sendError(res, 500, "INTERNAL_SERVER_ERROR", error.message);
            }
            return sendError(res, 500, "INTERNAL_SERVER_ERROR", String(error));
        }
    }

    async getPreferenceByVenue(req : Request, res : Response<ApiResponse<PreferencePayload>>) {
        try
        {
            const userId = req.params.userId;
            const venueId = req.params.venueId;

            const user : User | null = await this.userRepository.findOne({
                where : {
                    id : Number(userId)
                }
            });

            if(!user)
            {
                return sendError(res,404,"USER_NOT_FOUND","user does not exist with this id");
            }

            const venue : Venue | null = await this.venueRepository.findOne({
                where : {
                    id : Number(venueId)
                }
            });

            if(!venue)
            {
                return sendError(res,404,"VENUE_NOT_FOUND","venue does not exist with this id");
            }

            const preference : UserPreference | null = await this.userPreferenceRepository.findOne({
                where : {
                    user : {
                        id : Number(userId)
                    },
                    venue : {
                        id : Number(venueId)
                    }
                }
            });

            if(!preference)
            {
                return sendError(res,404,"NOT_FOUND","Preference not found");
            }

            const preferenceDto: UserPreferenceDto =
            {
                id: preference.id,
                pref_no: preference.pref_no,
                userId: Number(userId),
                venueId: Number(venueId),
            };

        return sendSuccess(
            res,
            {
                preference: preferenceDto,
            },
            "Successfully retrieved the preference"
        );
        }
        catch(error)
        {
            if (error instanceof Error) {
                return sendError(res, 500, "INTERNAL_SERVER_ERROR", error.message);
            }
            return sendError(res, 500, "INTERNAL_SERVER_ERROR", String(error));
        }
    }

    async getPreference(req: Request, res: Response<ApiResponse<PreferencePayload>>) {
        try {
            const pref_id = req.params.pref_id;
            if (!pref_id) {
                return sendError(res, 400, "BAD_REQUEST", "Pref id needs to be provided");
            }
            const preference: UserPreference | null = await this.userPreferenceRepository.findOne({
                where: {
                    id: Number(pref_id)
                }
            });
            if (!preference) {
                return sendError(res, 404, "NOT_FOUND", "There does not exists any preference with this pref id");
            }

            return sendSuccess(res, {
                preference
            }, "Successfully found the preference");
        }
        catch (error) {
            if (error instanceof Error) {
                return sendError(res, 500, "INTERNAL_SERVER_ERROR", error.message);
            }
            return sendError(res, 500, "INTERNAL_SERVER_ERROR", String(error));
        }
    }
    // Method to add a user preference for a venue
    async addPreference(req: Request, res: Response<ApiResponse<PreferencesPayload>>) {
        try {
            // Extract user ID, venue ID, and preference number from request body
            const { venueId, pref_no, userId } = req.body;
            const userId_ = req.params.userId_;
            // Validate that preference number is positive
            if (pref_no <= 0) {
                return sendError(res, 400, "BAD_REQUEST", "Preference number cannot be negative");
            }
            // Find the user by ID
            const user: User | null = await this.userRepository.findOne({
                where: {
                    id: Number(userId_)
                }
            });
            const userSender: User | null = await this.userRepository.findOne({
                where: {
                    id: Number(userId)
                }
            });
            // If user not found, return error
            if (!user || !userSender) {
                return sendError(res, 404, "NOT_FOUND", "User not found");
            }
            // only user can change its preference so need to check whether they match or not
            if (userSender.id !== user.id) {
                return sendError(res, 403, "FORBIDDEN", "Other users cannot change other user's name");
            }
            // Find the venue by ID
            const venue: Venue | null = await this.venueRepository.findOne({
                where: {
                    id: Number(venueId)
                }
            });
            // If venue not found, return error
            if (!venue) {
                return sendError(res, 404, "NOT_FOUND", "Venue not found");
            }

            const userPreferenceExisiting : UserPreference | null = await this.userPreferenceRepository.findOne({
                where : {
                    user : {
                        id : Number(userId)
                    },
                    pref_no : pref_no
                }
            });

            if(userPreferenceExisiting)
            {
                return sendError(res,400,"SAME_RANK_NOT_ALLOWED"," User cannot give equal preference to multiple Venues")
            }
            const existingVenuePreference = await this.userPreferenceRepository.findOne({
                where: {
                    user: {
                        id: Number(userId)
                    },
                    venue: {
                        id: Number(venueId)
                    }
                }
            });
            if (existingVenuePreference) {
                return sendError(res, 400, "VENUE_ALREADY_PREFERRED", "This venue is already in your preferences");
            }
            // Create a new UserPreference entity
            const userPreference = new UserPreference();
            userPreference.pref_no = pref_no;
            userPreference.user = user;
            userPreference.venue = venue;
            // Save the new preference to the database
            await this.userPreferenceRepository.save(userPreference);
            const preferences: UserPreference[] = await this.userPreferenceRepository
                .createQueryBuilder("preference")
                .where("preference.user.id = :userId", { userId: userId_ })
                .getMany();
            
            //const preferencesWithoutUser = preferences.map(({ user, ...preference }) => preference);
            return sendSuccess(res, {
                preferences : preferences
            }, "Successfully added the preference");
        }
        catch (error: unknown) {
            // Handle errors
            if (error instanceof Error) {
                return sendError(res, 500, "INTERNAL_SERVER_ERROR", error.message);
            }
            return sendError(res, 500, "INTERNAL_SERVER_ERROR", String(error));
        }
    }
    // async getOneHirerHistory(req : Request , res : Response)
    // {
    //     try
    //     {
    //         const userId =  req.params.userId;
    //         const historyId = req.params.historyId;
    //         const user : User | null = await this.userRepository.findOne({
    //             where : {
    //                 id : Number(userId)
    //             }
    //         });
    //         if(!user)
    //         {
    //             return res.status(404).json({
    //                 success : false,
    //                 message : "There is no users found"
    //             });
    //         }
    //         const user2 = await this.userRepository
    //                         .createQueryBuilder("users")
    //                         .leftJoinAndSelect("users.applications","applications")
    //                         .leftJoinAndSelect("applications.venue","venue")
    //                         .where("users.id = :userId",{userId : Number(userId)})
    //                         .where("")
    //                         .getOne();
    //     }
    //     catch(error : unknown)
    //     {
    //         if(error instanceof Error)
    //         {
    //             return res.status(500).json({
    //                 success : false,
    //                 message : error.message
    //             });
    //         }
    //         return res.status(500).json({
    //             success : false,
    //             message : String(error)
    //         });
    //     }
    // }
    async getVendorHistory(req: Request, res: Response<ApiResponse<VendorHistoryPayload>>) {
        try {
            const userId = req.params.userId;
            const user: User | null = await this.userRepository.findOne({
                where: {
                    id: Number(userId)
                }
            });
            if (!user) {
                return sendError(res, 404, "NOT_FOUND", "User does not exists");
            }
            if (user.role !== "vendor") {
                return sendError(res, 403, "FORBIDDEN", "Only vendors are allowed");
            }
            const vendor = await this.userRepository
                .createQueryBuilder("vendor")
                .leftJoinAndSelect("vendor.venues", "venue")
                .leftJoinAndSelect("venue.applications", "application")
                .leftJoinAndSelect("application.user", "hirer")
                .leftJoinAndSelect("application.review", "review")
                .where("vendor.id = :userId", { userId: Number(userId) })
                .getOne();
            if (!vendor) {
                return sendError(res, 404, "NOT_FOUND", "Vendor not found");
            }
            const vendor_history = vendor.venues.flatMap((venue) =>
                venue.applications.map((application) => ({
                    id: application.id,
                    hirerId: application.user.id,
                    venueName: venue.name,
                    location: venue.location,
                    eventName: application.eventName,
                    dateOfHire: application.date,
                    venueId: venue.id,
                    vendorId: vendor.id,
                    rating: application.review?.rating ?? null,
                    status: application.status
                }))
            );
            // nneed to get all the applications which are accepeted or rejected
            // export type HirerHistoryType = {
            //     id: number,
            //     hirerId: string,
            //     venueName: string,
            //     location: string,
            //     eventName: string,
            //     dateOfHire: string,
            //     venueId : string;
            //     vendorId : string;
            //     rating: number | null,
            //     status : "accepted" | "rejected"
            // }
            return sendSuccess(res, {
                vendor_history
            }, "Successfully got all the hirer history");
        }
        catch (error: unknown) {
            if (error instanceof Error) {
                return sendError(res, 500, "INTERNAL_SERVER_ERROR", error.message);
            }
            return sendError(res, 500, "INTERNAL_SERVER_ERROR", String(error));
        }
    }
    async getHirerHistory(req: Request, res: Response<ApiResponse<HirerHistoryPayload>>) {
        try {
            const userId = req.params.userId;
            const user: User | null = await this.userRepository.findOne({
                where: {
                    id: Number(userId)
                }
            });
            if (!user) {
                return sendError(res, 404, "NOT_FOUND", "User does not exists");
            }
            if (user.role !== "hirer") {
                return sendError(res, 403, "FORBIDDEN", "Only hirers are allowed");
            }
            const user2 = await this.userRepository
            .createQueryBuilder("user")
            .leftJoinAndSelect("user.applications", "application")
            .leftJoinAndSelect("application.venue", "venue")
            .leftJoinAndSelect("application.review", "review") // if Application has review relation
            .where("user.id = :userId", { userId: Number(userId) })
            .getOne();

            if (!user2) {
                return sendError(res,404,"NOT_FOUND","User not found");
            }

            const hirer_history = user2.applications.map((application) => ({
                id: application.id,
                hirerId: user2.id,
                venueName: application.venue.name,
                location: application.venue.location,
                eventName: application.eventName,
                dateOfHire: application.date,
                venueId: application.venue.id,
                vendorId: application.venue.userId,
                rating: application.review?.rating ?? null,
                status: application.status,
            }));
            // nneed to get all the applications which are accepeted or rejected
            // export type HirerHistoryType = {
            //     id: number,
            //     hirerId: string,
            //     venueName: string,
            //     location: string,
            //     eventName: string,
            //     dateOfHire: string,
            //     venueId : string;
            //     vendorId : string;
            //     rating: number | null,
            //     status : "accepted" | "rejected"
            // }
            return sendSuccess(res, {
                hirer_history
            }, "Successfully got all the hirer history");
        }
        catch (error: unknown) {
            if (error instanceof Error) {
                return sendError(res, 500, "INTERNAL_SERVER_ERROR", error.message);
            }
            return sendError(res, 500, "INTERNAL_SERVER_ERROR", String(error));
        }
    }
    // Method to update a user's preference number for a venue
    async updatePreference(req: Request, res: Response<ApiResponse<PreferencesPayload>>) {
        try {
            // Extract preference ID from request parameters
            const preference_id = req.params.pref_id;
            // Extract new preference number from request body
            const { pref_no, userId } = req.body;
            // Validate that preference number is positive
            if (!Number.isInteger(pref_no) || pref_no <= 0) {
                return sendError(res, 400, "BAD_REQUEST", "There is no negative preference number");
            }
            // Find the user preference by ID, including the related user
            const userPreference: UserPreference | null = await this.userPreferenceRepository
                .createQueryBuilder("user_pref")
                .leftJoinAndSelect("user_pref.user", "user")
                .where("id = :preference_id", { preference_id: Number(preference_id) })
                .getOne();
            // If preference not found, return error
            if (!userPreference) {
                return sendError(res, 404, "NOT_FOUND", "User Preference not found");
            }
            // Store old and new preference numbers
            const oldPrefNo = userPreference.pref_no;
            const newPrefNo = pref_no;
            // user Id of the preference
            const userId_ = userPreference.user.id;
            // only user can change its preference so need to check whether they match or not
            if (userId_ !== Number(userId)) {
                return sendError(res, 403, "FORBIDDEN", "User cannot update other user's information");
            }
            // If preference number unchanged, return early
            if (oldPrefNo === newPrefNo) {
                const preferences: UserPreference[] = await this.userPreferenceRepository
                .createQueryBuilder("preference")
                .where("preference.user.id = :userId", { userId: userId_ })
                .getMany();
                return sendSuccess(res, {
                    preferences
                }, "Preference number unchanged");
            }
            const preferenceCount = await this.userPreferenceRepository.count({
                where: {
                    user: {
                        id: userId_
                    }
                }
            });
            if (newPrefNo > preferenceCount) {
                return sendError(res, 400, "BAD_REQUEST", `Preference number must be between 1 and ${preferenceCount}`);
            }
            // If new preference is higher, shift down other preferences
            if (newPrefNo > oldPrefNo) {
                await this.userPreferenceRepository
                    .createQueryBuilder()
                    .update(UserPreference)
                    .set({
                        pref_no: () => "pref_no - 1"
                    })
                    .where("userId = :userId", { userId: userId_ })
                    .andWhere("pref_no > :oldPrefNo", { oldPrefNo })
                    .andWhere("pref_no <= :newPrefNo", { newPrefNo })
                    .execute();
            }
            // If new preference is lower, shift up other preferences
            if (newPrefNo < oldPrefNo) {
                await this.userPreferenceRepository
                    .createQueryBuilder()
                    .update(UserPreference)
                    .set({
                        pref_no: () => "pref_no + 1"
                    })
                    .where("userId = :userId", { userId: userId_ })
                    .andWhere("pref_no >= :newPrefNo", { newPrefNo })
                    .andWhere("pref_no < :oldPrefNo", { oldPrefNo })
                    .execute();
            }
            // Update the preference number
            userPreference.pref_no = newPrefNo;
            // Save the updated preference
            await this.userPreferenceRepository.save(userPreference);
            // Retrieve all user preferences (for response)
            const preferences: UserPreference[] = await this.userPreferenceRepository
                .createQueryBuilder("preference")
                .where("preference.user.id = :userId", { userId: userId_ })
                .getMany();
            
            //const preferencesWithoutUser = preferences.map(({ user, ...preference }) => preference);
            return sendSuccess(res, {
                preferences : preferences
            }, "Successfully updated all the preferences");
        }
        catch (error: unknown) {
            // Handle errors
            if (error instanceof Error) {
                return sendError(res, 500, "INTERNAL_SERVER_ERROR", error.message);
            }
            return sendError(res, 500, "INTERNAL_SERVER_ERROR", String(error));
        }
    }
    // Method to remove a user preference
    async removePreference(req: Request, res: Response<ApiResponse<PreferencesPayload>>) {
        try {
            // Extract preference ID from request parameters
            const preference_id = req.params.pref_id;
            const { userId } = req.body;
            // const user2 : User | null = await this.userRepository.findOne({
            //     where : {
            //         id : Number(userId)
            //     }
            // });
            // Find the user preference by ID
            const userPreference: UserPreference | null = await this.userPreferenceRepository
                .createQueryBuilder("userPreference")
                .leftJoinAndSelect("userPreference.user", "user")
                .where("userPreference.id = :pref_id", { pref_id: preference_id })
                .getOne();
            // If preference not found, return error
            if (!userPreference) {
                return sendError(res, 404, "NOT_FOUND", "There is no user preference found");
            }
            if (userPreference.user.id !== Number(userId)) {
                return sendError(res, 403, "FORBIDDEN", "Other users cannot change other user's preference");
            }
            // Remove the preference from the database
            await this.userPreferenceRepository.remove(userPreference);
            await this.userPreferenceRepository
                    .createQueryBuilder()
                    .update(UserPreference)
                    .set({
                        pref_no: () => "pref_no - 1"
                    })
                    .where("userId = :userId", { userId: Number(userId) })
                    .andWhere("pref_no > :deletedPrefNo", { deletedPrefNo: userPreference.pref_no })
                    .execute();
            
            const preferences: UserPreference[] = await this.userPreferenceRepository
                .createQueryBuilder("preference")
                .where("preference.user.id = :userId", { userId: userId })
                .getMany();
            
            //const preferencesWithoutUser = preferences.map(({ user, ...preference }) => preference);
            return sendSuccess(res, {
                preferences
            }, "Successfully removed the preference");
        }
        catch (error) {
            // Handle errors
            if (error instanceof Error) {
                return sendError(res, 500, "INTERNAL_SERVER_ERROR", error.message);
            }
            return sendError(res, 500, "INTERNAL_SERVER_ERROR", String(error));
        }
    }
}
