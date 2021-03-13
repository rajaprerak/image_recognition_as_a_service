package com.amazonaws.sample;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import com.amazonaws.services.ec2.AmazonEC2;
import com.amazonaws.services.sqs.AmazonSQSClientBuilder;
import com.amazonaws.services.ec2.AmazonEC2ClientBuilder;
import com.amazonaws.services.ec2.model.AmazonEC2Exception;
import com.amazonaws.services.ec2.model.DescribeInstanceStatusRequest;
import com.amazonaws.services.ec2.model.DescribeInstanceStatusResult;
import com.amazonaws.services.ec2.model.InstanceState;
import com.amazonaws.services.ec2.model.InstanceStateName;
import com.amazonaws.services.ec2.model.InstanceStatus;
import com.amazonaws.services.ec2.model.RunInstancesRequest;
import com.amazonaws.services.ec2.model.RunInstancesResult;
import com.amazonaws.services.ec2.model.TagSpecification;
import com.amazonaws.services.sqs.AmazonSQS;
import com.amazonaws.services.sqs.model.GetQueueAttributesRequest;
import com.amazonaws.services.ec2.model.Tag;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.regions.Regions;


@SpringBootApplication
public class LoadBalancer {

	public static void main(String[] args) {
		SpringApplication.run(LoadBalancer.class, args);
		scaleInScaleOut();
	}

	public static AmazonEC2 ec2 = AmazonEC2ClientBuilder.standard()
								.withCredentials(new AWSStaticCredentialsProvider(new BasicAWSCredentials("AKIA6JGAEEXD2JWXRFD2", "/i4iG65bDXU9qpqUI0G+cdxyjc1mhnt/FyF8dTLl")))
								.withRegion(Regions.US_EAST_1).build();

	public static AmazonSQS sqs = AmazonSQSClientBuilder.standard().withRegion(Regions.US_EAST_1).build();

	
	static Integer createInstance(String imageId, Integer maxInstances, Integer cnt) {
		int minInstances = maxInstances - 1; // create 1 instance
		int maxInstanceNum = maxInstances;
		if (minInstances == 0)
			minInstances = 1;
		
		List<String> securityGroupIds = new ArrayList<String>();
		securityGroupIds.add("cc_security_group");
		
		Collection<TagSpecification> tagSpecifications = new ArrayList<TagSpecification>();
		TagSpecification tagSpecification = new TagSpecification();
		Collection<Tag> tags = new ArrayList<Tag>();
		Tag t = new Tag();
		t.setKey("Name");
		t.setValue("app-instance"+cnt);
		tags.add(t);
		tagSpecification.setResourceType("instance");
		tagSpecification.setTags(tags);
		tagSpecifications.add(tagSpecification);
		RunInstancesRequest rir = new RunInstancesRequest(imageId, minInstances, maxInstanceNum);
		rir.setInstanceType("t2.micro");
		rir.setSecurityGroupIds(securityGroupIds);
		rir.setTagSpecifications(tagSpecifications);
		rir.setKeyName("cc_project");
		RunInstancesResult result = null;
		try {
			result = ec2.runInstances(rir);
		} catch (AmazonEC2Exception amzEc2Exp) {
			return cnt;
		} catch (Exception e) {
			return cnt;
		}
		return cnt;
	}

	static int getApproxtotalMsgs() {
		String queueName = "https://sqs.us-east-1.amazonaws.com/981802952135/cc-project-sqs-input";
		List<String> attrNames = new ArrayList<String>();
		attrNames.add("ApproximatetotalMsgs");
		GetQueueAttributesRequest getQueueAttributesRequest = new GetQueueAttributesRequest(queueName, attrNames);
		Map map = sqs.getQueueAttributes(getQueueAttributesRequest).getAttributes();
		String totalMsgsStr = (String) map.get("ApproximatetotalMsgs");
		Integer totalMsgs = Integer.valueOf(totalMsgsStr);
		return totalMsgs;

	}

	static Integer getNumOfInstances() {
		DescribeInstanceStatusRequest descReq = new DescribeInstanceStatusRequest();
		descReq.setIncludeAllInstances(true);
		DescribeInstanceStatusResult descInstances = ec2.describeInstanceStatus(descReq);
		List<InstanceStatus> instanceStatusList = descInstances.getInstanceStatuses();
		Integer totalRunningInstances = 0;
		for (InstanceStatus instanceStatus : instanceStatusList) {
			InstanceState instanceState = instanceStatus.getInstanceState();
			if (instanceState.getName().equals(InstanceStateName.Pending.toString())
					|| instanceState.getName().equals(InstanceStateName.Running.toString())) {
				totalRunningInstances++;
			}
		}

		return totalRunningInstances;
	}

	static void scaleInScaleOut() {
		Integer cnt = 0;
		while (true) {
			Integer totalMsgs = getApproxtotalMsgs();
			Integer totalRunningInstances = getNumOfInstances();
			Integer totalAppInstances = totalRunningInstances - 1;
			System.out.println("messages in Input Queue: " + totalMsgs);
			System.out.println("total app-instances: " + totalAppInstances);

			if (totalMsgs > 0 && totalMsgs > totalAppInstances) {
				Integer t = 19 - totalAppInstances;
				if (t > 0) {
					Integer t1 = totalMsgs - totalAppInstances;								
					Integer minInstances = Math.min(t, t1);
					for (int i=0; i < minInstances; i++) {
						cnt = createInstance("ami-0d8c4699047118969", 1, i+1);
					}										
					cnt++;
				}
			}
			try {
				Thread.sleep(3000);
			} catch (InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}
}
