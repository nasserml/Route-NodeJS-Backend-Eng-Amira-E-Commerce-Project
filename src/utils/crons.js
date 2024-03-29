import { scheduleJob } from 'node-schedule';

import Coupon from '../../DB/models/coupon.model.js';
import {DateTime} from 'luxon';
import { findDocumentByFind } from '../../DB/dbMethods.js';

// Generate a Cron job to check the coupon status 
/**
 * Schedule cron for coupon check and change coupon status to expired if the coupon is expired
 */
export const scheduleCronsForCouponCheck=()=>{
    
    // Schedule a cron job for run ebdert 5 seconds
    scheduleJob('*/5 * * * * *',async()=>{
        
        // Log message to the console that the schedule job is running
        console.log('scheduleCronsForCouponCheck() is running.................');

        // Find all the coupon that are valid
        const coupons=await findDocumentByFind(Coupon,{couponStatus:'valid'});
        
        // Loop through each coupon
        for(const coupon of coupons.isDocumentExists){

            // Check if the coupon is expired
            if(DateTime.fromISO(coupon.toDate)<DateTime.now()){

                // Change the coupon status to expired
                coupon.couponStatus='expired';

                // Save the coupon to the database
                await coupon.save();
            }
        }
    })
}
