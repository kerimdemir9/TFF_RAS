import { ratingLabels } from "./constants";

const getEventTimeString = (e) => {
  let result = e.time.elapsed;
  if (e.time.extra != 0 && e.time.extra != null) {
    result = result + " + " + e.time.extra;
  }

  return result;
};

const getReviewEventTimeString = (e) => {
  let result = e.time.elapsed + "’";
  if (e.time.extra != 0 && e.time.extra != null) {
    result = result + " +" + e.time.extra;
  }

  return result;
};

const getRatingLabelText = (value) => {
  return `${value} Star${value !== 1 ? "s" : ""}, ${ratingLabels[value]}`;
};

export { getEventTimeString, getReviewEventTimeString, getRatingLabelText };