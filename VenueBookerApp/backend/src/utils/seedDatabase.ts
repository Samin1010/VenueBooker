import { AppDataSource } from "../data-source";
import { Application } from "../entity/Application";
import { BookedTime } from "../entity/BookedTime";
import { Notification } from "../entity/Notification";
import { Review } from "../entity/Review";
import { User } from "../entity/User";
import { UserDocument } from "../entity/UserDocument";
import { UserPreference } from "../entity/UserPreference";
import { Venue } from "../entity/Venue";
import { DEFAULT_APPLICATIONS } from "../sample_data/sample_applications";
import { DEFAULT_REVIEWS } from "../sample_data/sample_rating";
import { DEFAULT_USERS } from "../sample_data/sample_users";
import { DEFAULT_VENUES } from "../sample_data/sample_venues";
import {
  ADMIN_APPLICATIONS,
  ADMIN_USERS,
  ADMIN_VENUES,
} from "../sample_data/sample_admin";

export async function seedDatabase() {
  await AppDataSource.transaction(async (manager) => {
    await manager.createQueryBuilder().delete().from(Notification).execute();
    await manager.createQueryBuilder().delete().from(BookedTime).execute();
    await manager.createQueryBuilder().delete().from(UserPreference).execute();
    await manager.createQueryBuilder().delete().from(UserDocument).execute();
    await manager.createQueryBuilder().delete().from(Review).execute();
    await manager.createQueryBuilder().delete().from(Application).execute();
    await manager.createQueryBuilder().delete().from(Venue).execute();
    await manager.createQueryBuilder().delete().from(User).execute();
    await manager.query(`SET IDENTITY_INSERT [user] ON`);

    const savedUsers = await manager.save(User, DEFAULT_USERS);
    const savedAdminUsers = await manager.save(User, ADMIN_USERS);

    await manager.query(`SET IDENTITY_INSERT [user] OFF`);

    const vendors = savedUsers.filter((user) => user.role === "vendor");
    const hirers = savedUsers.filter((user) => user.role === "hirer");
    
    const savedVenues : Venue[] = []
    for(let i  = 0;i < DEFAULT_VENUES.length;i++)
    {
      savedVenues.push(await manager.save(Venue,{...DEFAULT_VENUES[i],user : vendors[i % vendors.length]}));
    }

    const usersByUsername = new Map(
      [...savedUsers, ...savedAdminUsers].map((user) => [user.username, user]),
    );
    const savedAdminVenues: Venue[] = [];

    for (const { vendorUsername, ...venue } of ADMIN_VENUES) {
      const vendor = usersByUsername.get(vendorUsername);

      if (!vendor) {
        throw new Error(`Missing admin seed vendor: ${vendorUsername}`);
      }

      savedAdminVenues.push(await manager.save(Venue, { ...venue, user: vendor }));
    }

    // const savedVenues = await manager.save(
    //   Venue,
    //   DEFAULT_VENUES.map(({ userId, bookedTimes, ...venue }: any, index) => ({
    //     ...venue,
    //     user: vendors[index % vendors.length],
    //   }))
    // );

    const savedApplications = await manager.save(
      Application,
      DEFAULT_APPLICATIONS.map(({ userId, venueId, ...application }: any, index) => ({
        ...application,
        user: hirers[index % hirers.length],
        venue: savedVenues[index % savedVenues.length],
      }))
    );

    // used for retrieving the venue using venu name
    const venuesByName = new Map(
      // unpacking both the array to store all the venues
      [...savedVenues, ...savedAdminVenues].map((venue) => [venue.name, venue]),
    );

    await manager.save(
      Application,
      ADMIN_APPLICATIONS.map(
        ({ hirerUsername, venueName, ...application }) => {
          const user = usersByUsername.get(hirerUsername);
          const venue = venuesByName.get(venueName);

          if (!user || !venue) {
            throw new Error(
              `Missing admin seed relation: ${hirerUsername} / ${venueName}`,
            );
          }

          return { ...application, user, venue };
        },
      ),
    );

    const reviewsToSave: Partial<Review>[] = [];

    DEFAULT_REVIEWS.forEach((review, index) => {
      const application = savedApplications[index];

      if (review.rating === null || review.rating === undefined) {
        return;
      }

      if (!application) {
        return;
      }

      reviewsToSave.push({
        rating: review.rating,
        application: application,
      });
    });

    await manager.save(Review, reviewsToSave);
  });
}
