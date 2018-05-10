<?php
header('content-type: application/json');

require('../../../../../wp/wp-blog-header.php');

	/* JSON API TO RETREIVE CRC VALUES FOR AGENCY TREE POSTER */
	
	if (!empty($_GET['ID'])) {
        $ID = $_GET['ID'];
    }

	if (!empty($_GET['title'])) {
        $title = $_GET['title'];
    }
	
	if (!empty($_GET['type'])) {
        $type = $_GET['type'];
    }
	
	$companies_list = array();

	$afltcompanies = get_post_meta( $ID, 'aflt_companies', true );
	
	$awards1 = $wpdb->get_results( 
		" SELECT distinct
			(select meta_value from wp_strategy.pb_postmeta where post_id=p.id and meta_key='award-year') as award_year,
			(select meta_value from wp_strategy.pb_postmeta where post_id=p.id and meta_key='awarded-by') as awarded_by
	
			FROM wp_strategy.pb_posts p where p.post_status='publish' and p.post_type='awards' and p.id in
		(
				SELECT distinct post_id FROM wp_strategy.pb_postmeta
				where (meta_key='creative-directors-awarded' or meta_key = 'creative_directors_awarded2' or meta_key='art-directors-awarded' or meta_key='art_directors_awarded2' or meta_key='copywriters-awarded' or meta_key='copywriters_awarded2' or meta_key='planners_awarded' or meta_key='planners_awarded2')
				and meta_value like '%" . $ID . "%' 
		)
		order by award_year desc ");
        
	$titlesan = sanitize_title($title);
					
	$winningPosts = new WP_Query( 'posts_per_page=4&category_name=campaign&tag='.$titlesan );
					
	wp_reset_postdata();
                    
    $newsArgs = array( 
		'tag'               => $titlesan, 
        'category__not_in'  => 9671, 
        'tag__not_in'       => 20, 
        'paged'             => 1
    );

	$newsPosts = new WP_Query($newsArgs);

	$data = array();
	$data['associative'] = $afltcompanies;
	$data['awards'] = $awards1;
	$data['newsposts'] = $newsPosts->get_posts();
	$data['winningposts'] = $winningPosts->get_posts();
	
	switch ($type) {
    case "cw":
		$data['rank_2014'] = get_post_meta( $ID, 'rank_cw_2014', true );
		$data['rank_2015'] = get_post_meta( $ID, 'rank_cw_2015', true );
		$data['rank_2016'] = get_post_meta( $ID, 'rank_cw_2016', true );
		$data['rank_2017'] = get_post_meta( $ID, 'rank_cw_2017', true );
        break;
    case "pl":
        $data['rank_2014'] = get_post_meta( $ID, 'rank_pl_2014', true );
		$data['rank_2015'] = get_post_meta( $ID, 'rank_pl_2015', true );
		$data['rank_2016'] = get_post_meta( $ID, 'rank_pl_2016', true );
		$data['rank_2017'] = get_post_meta( $ID, 'rank_pl_2017', true );
        break;
    case "cd":
        $data['rank_2014'] = get_post_meta( $ID, 'rank_cd_2014', true );
		$data['rank_2015'] = get_post_meta( $ID, 'rank_cd_2015', true );
		$data['rank_2016'] = get_post_meta( $ID, 'rank_cd_2016', true );
		$data['rank_2017'] = get_post_meta( $ID, 'rank_cd_2017', true );
        break;
	 case "ad":
        $data['rank_2014'] = get_post_meta( $ID, 'rank_ad_2014', true );
		$data['rank_2015'] = get_post_meta( $ID, 'rank_ad_2015', true );
		$data['rank_2016'] = get_post_meta( $ID, 'rank_ad_2016', true );
		$data['rank_2017'] = get_post_meta( $ID, 'rank_ad_2017', true );
        break;
    default:
       
	}
	
	$jsonString = json_encode($data);
					
	header('HTTP/1.1 200 OK');
	print $jsonString;
