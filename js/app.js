"use strict";

var reviewUrl = 'https://api.parse.com/1/classes/tasks';

angular.module('ReviewPage', ['ui.bootstrap'])
    .config(function($httpProvider) {
        $httpProvider.defaults.headers.common['X-Parse-Application-Id'] = 'QFRzHr9BSLQ8Bfy74m75aXOEECj9pcwW1c3YK1Zo';
        $httpProvider.defaults.headers.common['X-Parse-REST-API-Key'] = 'AXWtvqNk3jjdn0xFBkUtDhoquKzkVkTiZR7JPkni';
    })

    .controller('CommentsController', function($scope, $http) {
        $scope.newReview = {deleted: false};

        //Adds a review comment to the list
        $scope.addComment = function() {
            $scope.inserting = true;
            $http.post(reviewUrl, $scope.newReview)
                .success(function(responseData) {
                    $scope.newReview.objectId = responseData.objectId;
                    $scope.reviews.push($scope.newReview);
                    $scope.newReview = {deleted: false};
                })
                .finally(function() {
                    document.getElementById('noComments').className = 'yesComments';
                    $scope.inserting = false;
                });
        }

        //Updates the review list with new reviews
        $scope.updateReview = function(review) {
            $http.put(reviewUrl + '/' + review.objectId, review)
        };

        //Refreshes the ordering of reviews upon load based on votes
        $scope.refreshReviews = function() {
            $http.get(reviewUrl + '?where={"deleted":false}')
                .success(function(data) {
                    $scope.reviews = data.results.sort($scope.compare);
                    if($scope.reviews.length == 0) {
                        document.getElementById('noComments').className = 'noComments';
                    } else {
                        document.getElementById('noComments').className = 'yesComments';
                    }
                });
        }

        $scope.refreshReviews();

        //Changes the amount of votes for each review comment
        $scope.incrementVotes = function(review, amount) {
            var amtVotes = {
                score: {
                    __op: "Increment",
                    amount: amount
                }
            };
            $scope.updating = true;
            if (amount == 1 || (amount == -1 && review.score > 0)) {
                $http.put(reviewUrl + '/' + review.objectId, amtVotes)
                    .success(function(responseData) {
                        if (responseData.score >= 0) {
                            review.score = responseData.score;
                        }
                    })
                    .error(function(err) {
                        console.log(err)
                    })
                    .finally(function() {
                        $scope.updating = false;
                    })
            }
        }

        //Compares the amount of votes in order to change the review list order
        $scope.compare = function(initialReview, nextReview) {
            if (initialReview.score > nextReview.score) {
                return -1;
            } else if (initialReview.score < nextReview.score) {
                return 1;
            } else {
                return 0;
            }
        }
    });